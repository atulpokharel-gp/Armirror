from __future__ import annotations

import json
import os

import aiofiles

from mirfish.schemas.core import MarkdownDocument, ProductRecord


class FileStorage:
    async def save_markdown(self, doc: MarkdownDocument, output_dir: str) -> str:
        os.makedirs(output_dir, exist_ok=True)
        import hashlib
        slug = hashlib.sha256(doc.url.encode()).hexdigest()[:12]
        filename = f"{slug}.md"
        filepath = os.path.join(output_dir, filename)

        content = f"# {doc.title}\n\n"
        content += f"**Source:** {doc.source_url}  \n"
        content += f"**Extracted:** {doc.extracted_at.isoformat()}  \n"
        content += f"**Words:** {doc.word_count}  \n\n"
        content += "---\n\n"
        content += doc.markdown

        async with aiofiles.open(filepath, "w", encoding="utf-8") as f:
            await f.write(content)

        return filepath

    async def save_product_json(self, product: ProductRecord, output_dir: str) -> str:
        os.makedirs(output_dir, exist_ok=True)
        filename = f"{product.id}.json"
        filepath = os.path.join(output_dir, filename)

        async with aiofiles.open(filepath, "w", encoding="utf-8") as f:
            await f.write(product.model_dump_json(indent=2))

        return filepath
