from __future__ import annotations

import json
import os
from datetime import datetime

import pyarrow as pa
import pyarrow.parquet as pq

from mirfish.schemas.core import MarkdownDocument, ProductRecord


def _product_to_row(p: ProductRecord) -> dict:
    d = p.model_dump()
    d["images"] = json.dumps([img if isinstance(img, dict) else img for img in d.get("images", [])])
    d["category_path"] = json.dumps(d.get("category_path", []))
    d["colors"] = json.dumps(d.get("colors", []))
    d["sizes"] = json.dumps(d.get("sizes", []))
    d["materials"] = json.dumps(d.get("materials", []))
    d["raw_structured_data"] = json.dumps(d.get("raw_structured_data", {}))
    d["provenance"] = json.dumps(d.get("provenance", {}))
    d["extracted_at"] = d["extracted_at"].isoformat() if isinstance(d.get("extracted_at"), datetime) else str(d.get("extracted_at", ""))
    return d


def _markdown_to_row(doc: MarkdownDocument) -> dict:
    d = doc.model_dump()
    d["extracted_at"] = d["extracted_at"].isoformat() if isinstance(d.get("extracted_at"), datetime) else str(d.get("extracted_at", ""))
    return d


class ParquetStorage:
    def write_products(self, products: list[ProductRecord], filepath: str) -> None:
        if not products:
            return
        os.makedirs(os.path.dirname(os.path.abspath(filepath)), exist_ok=True)
        rows = [_product_to_row(p) for p in products]
        table = pa.Table.from_pylist(rows)
        pq.write_table(table, filepath, compression="snappy")

    def write_markdown_docs(self, docs: list[MarkdownDocument], filepath: str) -> None:
        if not docs:
            return
        os.makedirs(os.path.dirname(os.path.abspath(filepath)), exist_ok=True)
        rows = [_markdown_to_row(d) for d in docs]
        table = pa.Table.from_pylist(rows)
        pq.write_table(table, filepath, compression="snappy")
