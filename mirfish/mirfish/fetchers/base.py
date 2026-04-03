from abc import ABC, abstractmethod
from dataclasses import dataclass, field


@dataclass
class FetchResult:
    html: str
    status_code: int
    headers: dict = field(default_factory=dict)
    final_url: str = ""


class BaseFetcher(ABC):
    @abstractmethod
    async def fetch(self, url: str) -> FetchResult:
        ...
