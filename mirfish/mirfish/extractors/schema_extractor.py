from __future__ import annotations

import json

from bs4 import BeautifulSoup

from mirfish.extractors.base import BaseExtractor


def extract_json_ld(html: str) -> list[dict]:
    soup = BeautifulSoup(html, "lxml")
    results: list[dict] = []
    for script in soup.find_all("script", type="application/ld+json"):
        try:
            data = json.loads(script.string or "{}")
            if isinstance(data, list):
                results.extend(data)
            else:
                results.append(data)
        except json.JSONDecodeError:
            continue
    return results


class SchemaExtractor(BaseExtractor):
    async def extract(self, html: str, url: str) -> dict:
        if not html:
            return {}

        all_ld = extract_json_ld(html)
        product_ld = self._find_product(all_ld)
        breadcrumb_ld = self._find_breadcrumb(all_ld)

        result: dict = {}

        if product_ld:
            result.update(self._parse_product(product_ld))

        if breadcrumb_ld:
            result["category_path"] = self._parse_breadcrumb(breadcrumb_ld)

        return result

    def _find_product(self, items: list[dict]) -> dict | None:
        for item in items:
            t = item.get("@type", "")
            if t == "Product" or (isinstance(t, list) and "Product" in t):
                return item
        return None

    def _find_breadcrumb(self, items: list[dict]) -> dict | None:
        for item in items:
            t = item.get("@type", "")
            if t == "BreadcrumbList" or (isinstance(t, list) and "BreadcrumbList" in t):
                return item
        return None

    def _parse_product(self, data: dict) -> dict:
        result: dict = {}

        if name := data.get("name"):
            result["product_name"] = str(name)

        if desc := data.get("description"):
            result["description_text"] = str(desc)

        if sku := data.get("sku"):
            result["sku"] = str(sku)

        if brand := data.get("brand"):
            if isinstance(brand, dict):
                result["brand_name"] = brand.get("name", "")
            else:
                result["brand_name"] = str(brand)

        images: list[str] = []
        img = data.get("image")
        if isinstance(img, str):
            images = [img]
        elif isinstance(img, list):
            for i in img:
                if isinstance(i, str):
                    images.append(i)
                elif isinstance(i, dict):
                    u = i.get("url") or i.get("contentUrl", "")
                    if u:
                        images.append(str(u))
        if images:
            result["images"] = images

        offers = data.get("offers")
        if offers:
            if isinstance(offers, list) and offers:
                offers = offers[0]
            if isinstance(offers, dict):
                if price := offers.get("price"):
                    try:
                        result["price_current"] = float(price)
                    except (ValueError, TypeError):
                        result["price_text_raw"] = str(price)
                if currency := offers.get("priceCurrency"):
                    result["currency"] = str(currency)
                if avail := offers.get("availability"):
                    result["availability_raw"] = str(avail)

        return result

    def _parse_breadcrumb(self, data: dict) -> list[str]:
        items = data.get("itemListElement", [])
        path: list[str] = []
        for item in sorted(items, key=lambda x: x.get("position", 0)):
            name = item.get("name") or (item.get("item") or {}).get("name", "")
            if name:
                path.append(str(name))
        return path
