from __future__ import annotations

import re
from typing import Optional

from mirfish.normalizers.base import BaseNormalizer

_AVAILABILITY_MAP: dict[str, str] = {
    "in stock": "in_stock",
    "in-stock": "in_stock",
    "instock": "in_stock",
    "available": "in_stock",
    "add to cart": "in_stock",
    "buy now": "in_stock",
    "out of stock": "out_of_stock",
    "out-of-stock": "out_of_stock",
    "outofstock": "out_of_stock",
    "sold out": "out_of_stock",
    "soldout": "out_of_stock",
    "not available": "out_of_stock",
    "unavailable": "out_of_stock",
    "preorder": "preorder",
    "pre-order": "preorder",
    "pre order": "preorder",
    "backorder": "backorder",
    "back order": "backorder",
    "back-order": "backorder",
    "limited": "limited",
    "limited stock": "limited",
    "low stock": "limited",
}

_SCHEMA_AVAILABILITY_MAP: dict[str, str] = {
    "https://schema.org/instock": "in_stock",
    "https://schema.org/outofstock": "out_of_stock",
    "https://schema.org/preorder": "preorder",
    "https://schema.org/backorder": "backorder",
    "https://schema.org/limitedavailability": "limited",
    "http://schema.org/instock": "in_stock",
    "http://schema.org/outofstock": "out_of_stock",
    "http://schema.org/preorder": "preorder",
    "http://schema.org/backorder": "backorder",
}

_SIZE_NORMALIZATION: dict[str, str] = {
    "x-small": "XS",
    "extra small": "XS",
    "x small": "XS",
    "small": "S",
    "medium": "M",
    "large": "L",
    "x-large": "XL",
    "extra large": "XL",
    "x large": "XL",
    "xx-large": "XXL",
    "2x-large": "XXL",
    "2xl": "XXL",
    "xxx-large": "XXXL",
    "3x-large": "XXXL",
    "3xl": "XXXL",
}


class ProductNormalizer(BaseNormalizer):
    def normalize(self, data: dict) -> dict:
        result = dict(data)

        price_text = result.get("price_text_raw") or result.get("price_current_raw", "")
        if price_text and not result.get("price_current"):
            price_val, currency = self.parse_price(str(price_text))
            if price_val is not None:
                result["price_current"] = price_val
            if currency and not result.get("currency"):
                result["currency"] = currency

        avail_raw = result.get("availability") or result.get("availability_raw", "")
        if avail_raw:
            result["availability"] = self.normalize_availability(str(avail_raw))

        sizes = result.get("sizes", [])
        if sizes:
            result["sizes"] = [self.normalize_size(s) for s in sizes]

        category_path = result.get("category_path", [])
        if category_path:
            result["category_path"] = self.normalize_category_path(category_path)

        return result

    def parse_price(self, price_str: str) -> tuple[Optional[float], Optional[str]]:
        if not price_str:
            return None, None

        currency_map = {"$": "USD", "€": "EUR", "£": "GBP", "¥": "JPY", "₩": "KRW"}
        iso_map = {
            "usd": "USD", "eur": "EUR", "gbp": "GBP", "jpy": "JPY",
            "cad": "CAD", "aud": "AUD", "chf": "CHF",
        }

        currency: Optional[str] = None
        for sym, code in currency_map.items():
            if sym in price_str:
                currency = code
                break

        if not currency:
            for iso, code in iso_map.items():
                if iso in price_str.lower():
                    currency = code
                    break

        cleaned = re.sub(r"[^\d.,]", "", price_str)
        if not cleaned:
            return None, currency

        if "," in cleaned and "." in cleaned:
            comma_idx = cleaned.rfind(",")
            dot_idx = cleaned.rfind(".")
            if comma_idx > dot_idx:
                cleaned = cleaned.replace(".", "").replace(",", ".")
            else:
                cleaned = cleaned.replace(",", "")
        elif "," in cleaned and cleaned.count(",") == 1:
            parts = cleaned.split(",")
            if len(parts[1]) <= 2:
                cleaned = cleaned.replace(",", ".")
            else:
                cleaned = cleaned.replace(",", "")

        try:
            return float(cleaned), currency
        except ValueError:
            return None, currency

    def normalize_availability(self, avail: str) -> str:
        if not avail:
            return "unknown"

        lower = avail.lower().strip()

        schema_result = _SCHEMA_AVAILABILITY_MAP.get(lower)
        if schema_result:
            return schema_result

        for pattern, normalized in _AVAILABILITY_MAP.items():
            if pattern in lower:
                return normalized

        if "stock" in lower:
            if "out" in lower or "no" in lower:
                return "out_of_stock"
            return "in_stock"

        return "unknown"

    def normalize_size(self, size: str) -> str:
        if not size:
            return size

        lower = size.lower().strip()

        direct = _SIZE_NORMALIZATION.get(lower)
        if direct:
            return direct

        upper = size.strip().upper()
        if upper in ("XS", "S", "M", "L", "XL", "XXL", "XXXL", "XXXXL"):
            return upper

        waist_inseam = re.match(r"^(\d+)[xX\s×](\d+)$", size.strip())
        if waist_inseam:
            return f"{waist_inseam.group(1)}x{waist_inseam.group(2)}"

        toddler = re.match(r"^(\d+)[Tt]$", size.strip())
        if toddler:
            return f"{toddler.group(1)}T"

        return size.strip()

    def normalize_category_path(self, path: list[str]) -> list[str]:
        seen: set[str] = set()
        result: list[str] = []
        skip_terms = {"home", "shop", "all"}
        for item in path:
            cleaned = item.strip()
            if not cleaned:
                continue
            lower = cleaned.lower()
            if lower in skip_terms:
                continue
            if lower not in seen:
                seen.add(lower)
                result.append(cleaned)
        return result

    def detect_currency(self, text: str) -> Optional[str]:
        _, currency = self.parse_price(text)
        return currency
