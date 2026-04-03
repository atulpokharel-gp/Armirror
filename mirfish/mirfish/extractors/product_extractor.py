from __future__ import annotations

import hashlib
import re
from datetime import datetime, timezone
from urllib.parse import urlparse

from selectolax.parser import HTMLParser

from mirfish.extractors.base import BaseExtractor
from mirfish.extractors.schema_extractor import SchemaExtractor
from mirfish.schemas.core import MediaAsset, ProductRecord


def _stable_id(url: str) -> str:
    return hashlib.sha256(url.encode()).hexdigest()[:16]


def _parse_domain(url: str) -> str:
    parsed = urlparse(url)
    return parsed.netloc or url


class ProductExtractor(BaseExtractor):
    def __init__(self, brand: str = "generic") -> None:
        self.brand = brand
        self._schema_extractor = SchemaExtractor()

    async def extract(self, html: str, url: str) -> dict:
        if not html:
            return self._empty_product(url)

        schema_data = await self._schema_extractor.extract(html, url)
        css_data = self._extract_css(html, url)

        merged = {**css_data, **{k: v for k, v in schema_data.items() if v}}

        product = self._build_product(merged, url)
        return product.model_dump()

    def _extract_css(self, html: str, url: str) -> dict:
        try:
            tree = HTMLParser(html)
        except Exception:
            return {}

        result: dict = {}

        name_el = (
            tree.css_first("h1.product-title")
            or tree.css_first("h1[class*='product']")
            or tree.css_first(".product-name h1")
            or tree.css_first("h1")
        )
        if name_el:
            result["product_name"] = name_el.text(strip=True)

        price_el = (
            tree.css_first("[class*='price-current']")
            or tree.css_first("[class*='sale-price']")
            or tree.css_first("[itemprop='price']")
            or tree.css_first("[class*='price']")
        )
        if price_el:
            price_text = price_el.text(strip=True)
            result["price_text_raw"] = price_text
            price_val = self._parse_price_simple(price_text)
            if price_val is not None:
                result["price_current"] = price_val

        original_el = (
            tree.css_first("[class*='price-original']")
            or tree.css_first("[class*='regular-price']")
            or tree.css_first("s[class*='price']")
        )
        if original_el:
            orig_text = original_el.text(strip=True)
            orig_val = self._parse_price_simple(orig_text)
            if orig_val is not None:
                result["price_original"] = orig_val

        sku_el = (
            tree.css_first("[itemprop='sku']")
            or tree.css_first("[class*='sku']")
            or tree.css_first("[data-sku]")
        )
        if sku_el:
            result["sku"] = (
                sku_el.attributes.get("content")
                or sku_el.attributes.get("data-sku")
                or sku_el.text(strip=True)
            )

        avail_el = tree.css_first("[itemprop='availability'], [class*='availability'], [class*='stock']")
        if avail_el:
            result["availability_raw"] = avail_el.text(strip=True)

        images: list[str] = []
        for img in tree.css("img[src]"):
            src = img.attributes.get("src", "")
            if src and not src.startswith("data:") and any(
                ext in src.lower() for ext in [".jpg", ".jpeg", ".png", ".webp", ".gif"]
            ):
                images.append(src)
        if images:
            result["images"] = images[:10]

        desc_el = (
            tree.css_first("[itemprop='description']")
            or tree.css_first("[class*='product-description']")
            or tree.css_first("[class*='product-detail']")
        )
        if desc_el:
            result["description_text"] = desc_el.text(separator="\n", strip=True)

        return result

    def _parse_price_simple(self, text: str) -> float | None:
        if not text:
            return None
        cleaned = re.sub(r"[^\d.,]", "", text)
        if not cleaned:
            return None
        if "." in cleaned and "," in cleaned:
            cleaned = cleaned.replace(",", "")
        elif "," in cleaned:
            parts = cleaned.split(",")
            if len(parts) == 2 and len(parts[1]) <= 2:
                cleaned = cleaned.replace(",", ".")
            else:
                cleaned = cleaned.replace(",", "")
        try:
            return float(cleaned)
        except ValueError:
            return None

    def _build_product(self, data: dict, url: str) -> ProductRecord:
        now = datetime.now(tz=timezone.utc)
        domain = _parse_domain(url)

        raw_images = data.get("images", [])
        media_assets: list[MediaAsset] = []
        for img in raw_images:
            if isinstance(img, str) and img:
                media_assets.append(MediaAsset(url=img, alt="", type="image"))

        return ProductRecord(
            id=_stable_id(url),
            brand=data.get("brand_name", self.brand),
            source_domain=domain,
            source_url=url,
            canonical_url=url,
            page_type="product",
            product_name=data.get("product_name") or None,
            subtitle=data.get("subtitle") or None,
            description_markdown=data.get("description_text") or None,
            category_path=data.get("category_path", []),
            currency=data.get("currency") or None,
            price_current=data.get("price_current") or None,
            price_original=data.get("price_original") or None,
            price_text_raw=data.get("price_text_raw") or None,
            availability=data.get("availability_raw") or None,
            sku=data.get("sku") or None,
            colors=data.get("colors", []),
            sizes=data.get("sizes", []),
            materials=data.get("materials", []),
            images=media_assets,
            raw_structured_data=data.get("raw_structured_data", {}),
            extracted_at=now,
            provenance={"extractor": "ProductExtractor", "url": url},
        )

    def _empty_product(self, url: str) -> dict:
        return ProductRecord(
            id=_stable_id(url),
            brand=self.brand,
            source_domain=_parse_domain(url),
            source_url=url,
            canonical_url=url,
            extracted_at=datetime.now(tz=timezone.utc),
        ).model_dump()
