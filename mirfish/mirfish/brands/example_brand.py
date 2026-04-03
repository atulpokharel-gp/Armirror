from __future__ import annotations

from mirfish.brands.base import BrandPlugin
from mirfish.schemas.core import BrandProfile, ProductRecord


class ExampleBrandPlugin(BrandPlugin):
    @property
    def profile(self) -> BrandProfile:
        return BrandProfile(
            domain="example-brand.com",
            seeds=["https://example-brand.com/shop"],
            url_rules={
                "product": r"/products/[^/]+$",
                "category": r"/collections/[^/]+$",
            },
            page_type_rules={},
            crawl_seeds=["https://example-brand.com/collections/all"],
            throttle_rps=1.5,
            export_formats=["jsonl", "parquet"],
        )

    @property
    def custom_selectors(self) -> dict:
        return {
            "product_name": "h1.product__title",
            "price": "span.price__current",
            "sku": "span[data-product-sku]",
            "description": "div.product__description",
            "images": "img.product__image",
        }

    def preprocess_html(self, html: str) -> str:
        # Strip cookie consent banners before extraction
        import re
        html = re.sub(r'<div[^>]+class="[^"]*cookie[^"]*"[^>]*>.*?</div>', "", html, flags=re.DOTALL | re.IGNORECASE)
        return html

    def postprocess_product(self, product: ProductRecord) -> ProductRecord:
        if product.brand == "generic":
            product = product.model_copy(update={"brand": "example-brand"})
        if product.source_domain and "example-brand.com" in product.source_domain:
            provenance = dict(product.provenance)
            provenance["brand_plugin"] = "ExampleBrandPlugin"
            product = product.model_copy(update={"provenance": provenance})
        return product
