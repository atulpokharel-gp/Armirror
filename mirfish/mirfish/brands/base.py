from __future__ import annotations

from mirfish.schemas.core import BrandProfile, ProductRecord


class BrandPlugin:
    @property
    def profile(self) -> BrandProfile:
        raise NotImplementedError

    @property
    def custom_selectors(self) -> dict:
        return {}

    def preprocess_html(self, html: str) -> str:
        return html

    def postprocess_product(self, product: ProductRecord) -> ProductRecord:
        return product
