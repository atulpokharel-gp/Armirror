from __future__ import annotations

import asyncio
import os

import aiofiles

from mirfish.schemas.core import MarkdownDocument, ProductRecord

_locks: dict[str, asyncio.Lock] = {}


def _get_lock(filepath: str) -> asyncio.Lock:
    if filepath not in _locks:
        _locks[filepath] = asyncio.Lock()
    return _locks[filepath]


class JsonlStorage:
    async def append_product(self, product: ProductRecord, filepath: str) -> None:
        os.makedirs(os.path.dirname(os.path.abspath(filepath)), exist_ok=True)
        lock = _get_lock(filepath)
        async with lock:
            async with aiofiles.open(filepath, "a", encoding="utf-8") as f:
                await f.write(product.model_dump_json() + "\n")

    async def append_markdown(self, doc: MarkdownDocument, filepath: str) -> None:
        os.makedirs(os.path.dirname(os.path.abspath(filepath)), exist_ok=True)
        lock = _get_lock(filepath)
        async with lock:
            async with aiofiles.open(filepath, "a", encoding="utf-8") as f:
                await f.write(doc.model_dump_json() + "\n")
