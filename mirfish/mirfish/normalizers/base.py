from abc import ABC, abstractmethod


class BaseNormalizer(ABC):
    @abstractmethod
    def normalize(self, data: dict) -> dict:
        ...
