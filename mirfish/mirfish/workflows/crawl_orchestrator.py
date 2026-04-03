from __future__ import annotations

import asyncio
import logging
import uuid
from datetime import datetime, timezone
from urllib.parse import urljoin, urlparse

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
from mirfish.utils.html_utils import extract_links

logger = logging.getLogger(__name__)


class CrawlOrchestrator:
    def __init__(self) -> None:
        self._classifier = PageClassifier()
        self._products: list[ProductRecord] = []
        self._errors: list[CrawlError] = []

    async def crawl(self, config: CrawlConfig) -> CrawlRunSummary:
        run_id = str(uuid.uuid4())
        start_time = datetime.now(tz=timezone.utc)

        summary = CrawlRunSummary(
            run_id=run_id,
            brand=config.brand,
            start_time=start_time,
        )

        visited: set[str] = set()
        queue: asyncio.Queue[tuple[str, int]] = asyncio.Queue()
        semaphore = asyncio.Semaphore(config.concurrency)

        for seed in config.seed_urls:
            await queue.put((seed, 0))

        extractor = ProductExtractor(brand=config.brand)

        async with HttpFetcher(
            user_agent=config.user_agent,
            timeout=config.timeout,
            retries=config.retries,
            rate_limit_rps=config.rate_limit_rps,
        ) as fetcher:
            pending_tasks: list[asyncio.Task] = []

            while (not queue.empty() or pending_tasks) and len(visited) < config.max_pages:
                while not queue.empty() and len(visited) < config.max_pages:
                    try:
                        url, depth = queue.get_nowait()
                    except asyncio.QueueEmpty:
                        break

                    if url in visited or depth > config.max_depth:
                        continue

                    visited.add(url)

                    task = asyncio.create_task(
                        self._process_url(
                            url=url,
                            depth=depth,
                            config=config,
                            fetcher=fetcher,
                            extractor=extractor,
                            semaphore=semaphore,
                            queue=queue,
                            visited=visited,
                        )
                    )
                    pending_tasks.append(task)

                if pending_tasks:
                    done, pending_tasks_set = await asyncio.wait(
                        pending_tasks, return_when=asyncio.FIRST_COMPLETED
                    )
                    pending_tasks = list(pending_tasks_set)
                    for task in done:
                        exc = task.exception()
                        if exc:
                            logger.error("Task error: %s", exc)
                else:
                    break

            if pending_tasks:
                results = await asyncio.gather(*pending_tasks, return_exceptions=True)
                for result in results:
                    if isinstance(result, Exception):
                        logger.error("Task error: %s", result)

        summary.pages_crawled = len(visited)
        summary.products_extracted = len(self._products)
        summary.errors = self._errors
        summary.end_time = datetime.now(tz=timezone.utc)

        return summary

    async def _process_url(
        self,
        url: str,
        depth: int,
        config: CrawlConfig,
        fetcher: HttpFetcher,
        extractor: ProductExtractor,
        semaphore: asyncio.Semaphore,
        queue: asyncio.Queue,
        visited: set[str],
    ) -> None:
        async with semaphore:
            try:
                fetch_result = await fetcher.fetch(url)
                html = fetch_result.html
                page_type, confidence = self._classifier.classify(url, html)

                logger.info("Crawled %s -> %s (%.2f)", url, page_type, confidence)

                if page_type == PageType.product:
                    product_data = await extractor.extract(html, url)
                    product = ProductRecord(**product_data)
                    self._products.append(product)

                if depth < config.max_depth:
                    links = extract_links(html, url)
                    domain = urlparse(url).netloc
                    for link in links:
                        link_domain = urlparse(link).netloc
                        if link_domain == domain and link not in visited:
                            if self._should_include(link, config):
                                await queue.put((link, depth + 1))

            except Exception as exc:
                self._errors.append(
                    CrawlError(
                        url=url,
                        error_type=type(exc).__name__,
                        message=str(exc),
                        timestamp=datetime.now(tz=timezone.utc),
                    )
                )
                logger.error("Error crawling %s: %s", url, exc)

    def _should_include(self, url: str, config: CrawlConfig) -> bool:
        import fnmatch

        for pattern in config.exclude_patterns:
            if fnmatch.fnmatch(url, pattern) or pattern in url:
                return False

        if config.include_patterns:
            for pattern in config.include_patterns:
                if fnmatch.fnmatch(url, pattern) or pattern in url:
                    return True
            return False

        return True

    @property
    def products(self) -> list[ProductRecord]:
        return self._products

    @property
    def errors(self) -> list[CrawlError]:
        return self._errors
