from abc import ABC, abstractmethod

from mirfish.schemas.core import PageType


class BasePageClassifier(ABC):
    @abstractmethod
    def classify(self, url: str, html: str) -> tuple[PageType, float]:
        ...
