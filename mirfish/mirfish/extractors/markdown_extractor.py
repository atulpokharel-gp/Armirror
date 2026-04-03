from __future__ import annotations

from datetime import datetime, timezone

import trafilatura
from selectolax.parser import HTMLParser

from mirfish.extractors.base import BaseExtractor


class MarkdownExtractor(BaseExtractor):
    async def extract(self, html: str, url: str) -> dict:
        if not html:
            return self._empty_result(url)

        markdown = self._extract_with_trafilatura(html, url)
        title = self._extract_title(html)

        if not markdown:
            markdown = self._fallback_extract(html)

        word_count = len(markdown.split()) if markdown else 0

        return {
            "url": url,
            "title": title,
            "markdown": markdown or "",
            "source_url": url,
            "extracted_at": datetime.now(tz=timezone.utc),
            "word_count": word_count,
        }

    def _extract_with_trafilatura(self, html: str, url: str) -> str:
        try:
            result = trafilatura.extract(
                html,
                include_tables=True,
                include_links=True,
                output_format="markdown",
                url=url,
                no_fallback=False,
            )
            return result or ""
        except Exception:
            return ""

    def _fallback_extract(self, html: str) -> str:
        try:
            tree = HTMLParser(html)
            for tag in tree.css("script, style, nav, footer, header"):
                tag.decompose()
            body = tree.css_first("main, article, [role='main'], body")
            if body:
                return body.text(separator="\n", strip=True)
            return tree.text(separator="\n", strip=True)
        except Exception:
            return ""

    def _extract_title(self, html: str) -> str:
        try:
            tree = HTMLParser(html)
            og_title = tree.css_first('meta[property="og:title"]')
            if og_title and og_title.attributes.get("content"):
                return og_title.attributes["content"].strip()
            title_tag = tree.css_first("title")
            if title_tag:
                return title_tag.text(strip=True)
            h1 = tree.css_first("h1")
            if h1:
                return h1.text(strip=True)
        except Exception:
            pass
        return ""

    def _empty_result(self, url: str) -> dict:
        return {
            "url": url,
            "title": "",
            "markdown": "",
            "source_url": url,
            "extracted_at": datetime.now(tz=timezone.utc),
            "word_count": 0,
        }
