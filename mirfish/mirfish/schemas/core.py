from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Literal, Optional

from pydantic import BaseModel, Field


class PageType(str, Enum):
    home = "home"
    category = "category"
    product = "product"
    search = "search"
    editorial = "editorial"
    blog = "blog"
    policy = "policy"
    unknown = "unknown"


class CrawlConfig(BaseModel):
    seed_urls: list[str]
    max_depth: int = 3
    max_pages: int = 100
    concurrency: int = 5
    render_mode: Literal["http", "browser", "auto"] = "http"
    include_patterns: list[str] = Field(default_factory=list)
    exclude_patterns: list[str] = Field(default_factory=list)
    output_dir: str = "./runs"
    output_formats: list[str] = Field(default_factory=lambda: ["jsonl", "md"])
    rate_limit_rps: float = 2.0
    respect_robots: bool = True
    user_agent: str = "mirfish/0.1.0"
    timeout: float = 30.0
    retries: int = 3
    brand: str = "generic"


class BrandProfile(BaseModel):
    domain: str
    seeds: list[str]
    url_rules: dict = Field(default_factory=dict)
    page_type_rules: dict = Field(default_factory=dict)
    crawl_seeds: list[str] = Field(default_factory=list)
    throttle_rps: float = 2.0
    export_formats: list[str] = Field(default_factory=lambda: ["jsonl"])


class PageRecord(BaseModel):
    id: str
    url: str
    canonical_url: str
    page_type: PageType
    status_code: int
    fetched_at: datetime
    render_mode: str
    html_size: int
    extracted_at: Optional[datetime] = None


class MarkdownDocument(BaseModel):
    url: str
    title: str
    markdown: str
    source_url: str
    extracted_at: datetime
    word_count: int


class ProductVariant(BaseModel):
    sku: Optional[str] = None
    color: Optional[str] = None
    size: Optional[str] = None
    price: Optional[float] = None
    availability: Optional[str] = None


class MediaAsset(BaseModel):
    url: str
    alt: str = ""
    type: str = "image"


class ProductRecord(BaseModel):
    id: str
    brand: str
    source_domain: str
    source_url: str
    canonical_url: str
    page_type: str = "product"
    product_name: Optional[str] = None
    subtitle: Optional[str] = None
    description_markdown: Optional[str] = None
    category_path: list[str] = Field(default_factory=list)
    currency: Optional[str] = None
    price_current: Optional[float] = None
    price_original: Optional[float] = None
    price_text_raw: Optional[str] = None
    availability: Optional[str] = None
    sku: Optional[str] = None
    colors: list[str] = Field(default_factory=list)
    sizes: list[str] = Field(default_factory=list)
    materials: list[str] = Field(default_factory=list)
    fit_notes: Optional[str] = None
    care: Optional[str] = None
    images: list[MediaAsset] = Field(default_factory=list)
    raw_structured_data: dict = Field(default_factory=dict)
    extracted_at: datetime
    provenance: dict = Field(default_factory=dict)


class CrawlError(BaseModel):
    url: str
    error_type: str
    message: str
    timestamp: datetime


class ExtractionInstruction(BaseModel):
    url: str
    instruction: str
    output_schema: dict


class CrawlRunSummary(BaseModel):
    run_id: str
    brand: str
    start_time: datetime
    end_time: Optional[datetime] = None
    pages_crawled: int = 0
    products_extracted: int = 0
    errors: list[CrawlError] = Field(default_factory=list)
    markdown_docs: int = 0
    exported_files: list[str] = Field(default_factory=list)
