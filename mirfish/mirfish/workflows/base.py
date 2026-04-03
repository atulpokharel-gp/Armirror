from abc import ABC, abstractmethod

from mirfish.schemas.core import CrawlConfig, CrawlRunSummary, PageType, ProductRecord


class BaseBrandWorkflow(ABC):
    @abstractmethod
    async def run(self, config: CrawlConfig) -> CrawlRunSummary:
        ...

    @abstractmethod
    async def process_page(
        self, url: str, html: str, page_type: PageType
    ) -> list[ProductRecord]:
        ...
