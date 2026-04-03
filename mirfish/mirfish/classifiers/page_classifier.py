from __future__ import annotations

import json
import re
from urllib.parse import urlparse

from selectolax.parser import HTMLParser

from mirfish.classifiers.base import BasePageClassifier
from mirfish.schemas.core import PageType

_PRODUCT_URL_PATTERNS = [
    r"/product[s]?/",
    r"/p/",
    r"/item[s]?/",
    r"/shop/[^/]+$",
    r"-p-\d+",
    r"/pdp/",
    r"\?.*(?:sku|productid|product_id|itemid)=",
]

_CATEGORY_URL_PATTERNS = [
    r"/categor(?:y|ies)/",
    r"/collection[s]?/",
    r"/c/",
    r"/browse/",
    r"/department[s]?/",
    r"/catalog/",
    r"/shop/?$",
    r"/shop/[^?]+/$",
]

_SEARCH_URL_PATTERNS = [
    r"/search",
    r"[?&]q=",
    r"[?&]query=",
    r"[?&]s=",
    r"[?&]keyword=",
]

_BLOG_URL_PATTERNS = [
    r"/blog/",
    r"/news/",
    r"/article[s]?/",
    r"/editorial[s]?/",
    r"/post[s]?/",
]

_POLICY_URL_PATTERNS = [
    r"/privacy",
    r"/terms",
    r"/faq",
    r"/returns?",
    r"/shipping",
    r"/about",
    r"/contact",
    r"/cookie",
    r"/legal",
]


class PageClassifier(BasePageClassifier):
    def classify(self, url: str, html: str) -> tuple[PageType, float]:
        url_type, url_confidence = self._classify_by_url(url)
        html_type, html_confidence = self._classify_by_html(html, url)

        if url_confidence >= 0.85:
            return url_type, url_confidence

        if html_confidence >= 0.8:
            if url_confidence > 0 and url_type == html_type:
                return html_type, min(1.0, html_confidence + 0.1)
            return html_type, html_confidence

        if url_confidence > html_confidence:
            return url_type, url_confidence

        if html_type != PageType.unknown:
            return html_type, html_confidence

        if url_type != PageType.unknown:
            return url_type, url_confidence

        parsed = urlparse(url)
        path = parsed.path.rstrip("/")
        if path == "" or path == "/":
            return PageType.home, 0.9

        return PageType.unknown, 0.0

    def _classify_by_url(self, url: str) -> tuple[PageType, float]:
        url_lower = url.lower()

        parsed = urlparse(url_lower)
        path = parsed.path
        query = parsed.query

        if not path or path == "/":
            return PageType.home, 0.95

        for pattern in _PRODUCT_URL_PATTERNS:
            if re.search(pattern, url_lower):
                return PageType.product, 0.85

        for pattern in _CATEGORY_URL_PATTERNS:
            if re.search(pattern, url_lower):
                return PageType.category, 0.80

        for pattern in _SEARCH_URL_PATTERNS:
            if re.search(pattern, url_lower):
                return PageType.search, 0.90

        for pattern in _BLOG_URL_PATTERNS:
            if re.search(pattern, url_lower):
                return PageType.blog, 0.85

        for pattern in _POLICY_URL_PATTERNS:
            if re.search(pattern, url_lower):
                return PageType.policy, 0.85

        return PageType.unknown, 0.0

    def _classify_by_html(self, html: str, url: str) -> tuple[PageType, float]:
        if not html:
            return PageType.unknown, 0.0

        score: dict[PageType, float] = {pt: 0.0 for pt in PageType}

        # JSON-LD signals
        json_ld_type = self._extract_json_ld_type(html)
        if json_ld_type == "Product":
            score[PageType.product] += 0.7
        elif json_ld_type in ("CollectionPage", "ItemList"):
            score[PageType.category] += 0.6
        elif json_ld_type in ("Article", "BlogPosting", "NewsArticle"):
            score[PageType.blog] += 0.7
        elif json_ld_type == "SearchResultsPage":
            score[PageType.search] += 0.7
        elif json_ld_type == "WebPage":
            score[PageType.home] += 0.3

        try:
            tree = HTMLParser(html)
        except Exception:
            return PageType.unknown, 0.0

        # Add-to-cart signals
        cart_keywords = ["add to cart", "add to bag", "buy now", "add to basket"]
        page_text = html.lower()
        for kw in cart_keywords:
            if kw in page_text:
                score[PageType.product] += 0.25
                break

        # Product-specific elements
        if tree.css_first('[class*="product-detail"]'):
            score[PageType.product] += 0.2
        if tree.css_first('[itemtype*="Product"]'):
            score[PageType.product] += 0.3
        if tree.css_first('[class*="product-grid"], [class*="product-list"]'):
            score[PageType.category] += 0.3
        if tree.css_first('input[type="search"], [class*="search-result"]'):
            score[PageType.search] += 0.2

        # Breadcrumb helps identify non-home pages
        if tree.css_first('[class*="breadcrumb"]'):
            score[PageType.product] += 0.05
            score[PageType.category] += 0.05

        best_type = max(score, key=lambda k: score[k])
        best_score = score[best_type]

        if best_score < 0.2:
            return PageType.unknown, 0.0

        return best_type, min(1.0, best_score)

    def _extract_json_ld_type(self, html: str) -> str:
        pattern = r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>'
        for match in re.finditer(pattern, html, re.DOTALL | re.IGNORECASE):
            try:
                data = json.loads(match.group(1))
                if isinstance(data, list):
                    for item in data:
                        t = item.get("@type", "")
                        if t:
                            return t
                elif isinstance(data, dict):
                    t = data.get("@type", "")
                    if t:
                        return t
            except (json.JSONDecodeError, AttributeError):
                continue
        return ""
