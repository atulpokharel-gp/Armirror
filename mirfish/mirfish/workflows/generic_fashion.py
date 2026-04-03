from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone
from urllib.parse import urlparse

import httpx

from mirfish.classifiers.page_classifier import PageClassifier
from mirfish.extractors.product_extractor import ProductExtractor
from mirfish.fetchers.http import HttpFetcher
from mirfish.schemas.core import (
    CrawlConfig,
    CrawlError,
    CrawlRunSummary,
    PageType,
    ProductRecord,
)
from mirfish.utils.url_utils import fetch_sitemap_urls
from mirfish.workflows.base import BaseBrandWorkflow
from mirfish.workflows.crawl_orchestrator import CrawlOrchestrator

logger = logging.getLogger(__name__)


class GenericFashionWorkflow(BaseBrandWorkflow):
    def __init__(self) -> None:
        self._classifier = PageClassifier()
        self._extractor: ProductExtractor | None = None
        self._errors: list[CrawlError] = []

    async def run(self, config: CrawlConfig) -> CrawlRunSummary:
        run_id = str(uuid.uuid4())
        start_time = datetime.now(tz=timezone.utc)
        self._extractor = ProductExtractor(brand=config.brand)

        enriched_seeds = await self._discover_seeds(config)
        enriched_config = config.model_copy(update={"seed_urls": enriched_seeds})

        orchestrator = CrawlOrchestrator()
        summary = await orchestrator.crawl(enriched_config)
        summary.run_id = run_id
        summary.start_time = start_time
        summary.end_time = datetime.now(tz=timezone.utc)
        summary.errors.extend(self._errors)

        return summary

    async def process_page(
        self, url: str, html: str, page_type: PageType
    ) -> list[ProductRecord]:
        if page_type != PageType.product or self._extractor is None:
            return []
        data = await self._extractor.extract(html, url)
        return [ProductRecord(**data)]

    async def _discover_seeds(self, config: CrawlConfig) -> list[str]:
        seeds = list(config.seed_urls)

        if not seeds:
            return seeds

        base_url = seeds[0]
        parsed = urlparse(base_url)
        origin = f"{parsed.scheme}://{parsed.netloc}"

        sitemap_urls: list[str] = []
        try:
            async with httpx.AsyncClient(
                follow_redirects=True,
                timeout=10.0,
                headers={"User-Agent": config.user_agent},
            ) as client:
                sitemap_urls = await fetch_sitemap_urls(origin, client)
        except Exception as exc:
            logger.warning("Sitemap discovery failed: %s", exc)

        product_urls = [
            u for u in sitemap_urls
            if self._classifier.classify(u, "")[0] == PageType.product
        ]

        category_urls = [
            u for u in sitemap_urls
            if self._classifier.classify(u, "")[0] == PageType.category
        ]

        combined = seeds + category_urls[:20] + product_urls[:50]
        seen: set[str] = set()
        unique: list[str] = []
        for u in combined:
            if u not in seen:
                seen.add(u)
                unique.append(u)

        return unique
