from abc import ABC, abstractmethod

from mirfish.schemas.core import ProductRecord


class BaseLLMExtractor(ABC):
    @abstractmethod
    async def extract(self, html: str, instruction: str, output_schema: dict) -> dict:
        ...

    @abstractmethod
    async def extract_product(self, html: str, url: str) -> ProductRecord:
        ...
