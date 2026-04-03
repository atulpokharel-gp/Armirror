from abc import ABC, abstractmethod

from mirfish.fetchers.base import FetchResult


class BaseRenderer(ABC):
    @abstractmethod
    async def render(self, url: str) -> FetchResult:
        ...

    async def __aenter__(self) -> "BaseRenderer":
        return self

    async def __aexit__(self, *args: object) -> None:
        pass
