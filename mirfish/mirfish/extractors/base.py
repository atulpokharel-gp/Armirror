from abc import ABC, abstractmethod


class BaseExtractor(ABC):
    @abstractmethod
    async def extract(self, html: str, url: str) -> dict:
        ...
