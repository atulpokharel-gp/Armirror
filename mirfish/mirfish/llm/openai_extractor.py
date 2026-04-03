from __future__ import annotations

import json
import logging
import os
from datetime import datetime, timezone

from openai import AsyncOpenAI
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential

from mirfish.llm.base import BaseLLMExtractor
from mirfish.schemas.core import ProductRecord

logger = logging.getLogger(__name__)

_PRODUCT_SYSTEM_PROMPT = """You are a product data extraction assistant. Given HTML content from an e-commerce product page, extract structured product information.

Return a JSON object with these fields (use null for missing values):
{
  "product_name": string or null,
  "subtitle": string or null,
  "description_markdown": string or null,
  "currency": string (e.g. "USD") or null,
  "price_current": number or null,
  "price_original": number or null,
  "availability": string ("in_stock", "out_of_stock", "preorder") or null,
  "sku": string or null,
  "colors": list of strings,
  "sizes": list of strings,
  "materials": list of strings,
  "category_path": list of strings,
  "images": list of image URLs
}

Extract only factual information present in the HTML. Do not invent data."""


class OpenAIExtractor(BaseLLMExtractor):
    def __init__(
        self,
        api_key: str | None = None,
        model: str = "gpt-4o",
        max_tokens: int = 2000,
    ) -> None:
        self.model = model
        self.max_tokens = max_tokens
        self._client = AsyncOpenAI(api_key=api_key or os.environ.get("OPENAI_API_KEY"))

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=15),
        retry=retry_if_exception_type((json.JSONDecodeError, ValueError)),
        reraise=True,
    )
    async def extract(self, html: str, instruction: str, output_schema: dict) -> dict:
        truncated_html = html[:12000] if len(html) > 12000 else html

        schema_str = json.dumps(output_schema, indent=2)
        user_content = f"""Instruction: {instruction}

Output schema:
{schema_str}

HTML content:
{truncated_html}

Respond with ONLY valid JSON matching the schema above."""

        try:
            response = await self._client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a data extraction assistant. Always respond with valid JSON."},
                    {"role": "user", "content": user_content},
                ],
                max_tokens=self.max_tokens,
                response_format={"type": "json_object"},
            )
            content = response.choices[0].message.content or "{}"
            return json.loads(content)
        except json.JSONDecodeError as exc:
            logger.error("JSON decode error from OpenAI response: %s", exc)
            raise
        except Exception as exc:
            logger.error("OpenAI API error: %s", exc)
            return {}

    async def extract_product(self, html: str, url: str) -> ProductRecord:
        truncated_html = html[:12000] if len(html) > 12000 else html

        user_content = f"""Extract product information from this HTML page.
URL: {url}

HTML:
{truncated_html}

Return JSON with product fields."""

        try:
            response = await self._client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": _PRODUCT_SYSTEM_PROMPT},
                    {"role": "user", "content": user_content},
                ],
                max_tokens=self.max_tokens,
                response_format={"type": "json_object"},
            )
            content = response.choices[0].message.content or "{}"
            data = json.loads(content)
        except (json.JSONDecodeError, Exception) as exc:
            logger.error("LLM extraction failed: %s", exc)
            data = {}

        from urllib.parse import urlparse
        import hashlib

        domain = urlparse(url).netloc
        product_id = hashlib.sha256(url.encode()).hexdigest()[:16]

        from mirfish.schemas.core import MediaAsset

        raw_images = data.get("images", [])
        images = [MediaAsset(url=img, alt="", type="image") for img in raw_images if isinstance(img, str)]

        return ProductRecord(
            id=product_id,
            brand=data.get("brand", "unknown"),
            source_domain=domain,
            source_url=url,
            canonical_url=url,
            product_name=data.get("product_name"),
            subtitle=data.get("subtitle"),
            description_markdown=data.get("description_markdown"),
            currency=data.get("currency"),
            price_current=data.get("price_current"),
            price_original=data.get("price_original"),
            availability=data.get("availability"),
            sku=data.get("sku"),
            colors=data.get("colors", []),
            sizes=data.get("sizes", []),
            materials=data.get("materials", []),
            category_path=data.get("category_path", []),
            images=images,
            extracted_at=datetime.now(tz=timezone.utc),
            provenance={"extractor": "OpenAIExtractor", "model": self.model, "url": url},
        )
