from __future__ import annotations

import json
import re
import unicodedata
from urllib.parse import urljoin

from bs4 import BeautifulSoup
from selectolax.parser import HTMLParser


def extract_links(html: str, base_url: str) -> list[str]:
    if not html:
        return []
    try:
        tree = HTMLParser(html)
        links: list[str] = []
        for a in tree.css("a[href]"):
            href = a.attributes.get("href", "").strip()
            if not href or href.startswith(("#", "javascript:", "mailto:", "tel:")):
                continue
            full = urljoin(base_url, href)
            links.append(full)
        return list(dict.fromkeys(links))
    except Exception:
        return []


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


def clean_text(text: str) -> str:
    if not text:
        return ""
    text = unicodedata.normalize("NFKC", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def extract_meta(html: str) -> dict:
    if not html:
        return {}
    try:
        tree = HTMLParser(html)
    except Exception:
        return {}

    result: dict = {}

    title = tree.css_first("title")
    if title:
        result["title"] = title.text(strip=True)

    for meta in tree.css("meta"):
        name = meta.attributes.get("name", "") or meta.attributes.get("property", "")
        content = meta.attributes.get("content", "")
        if not name or not content:
            continue
        name_lower = name.lower()
        if name_lower == "description":
            result["description"] = content
        elif name_lower.startswith("og:"):
            result[name_lower] = content
        elif name_lower.startswith("twitter:"):
            result[name_lower] = content

    return result
