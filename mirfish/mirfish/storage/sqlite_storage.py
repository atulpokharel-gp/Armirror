from __future__ import annotations

import asyncio
import json
import os
import sqlite3
from datetime import datetime, timezone
from typing import Optional


class SqliteStorage:
    def __init__(self, db_path: str) -> None:
        self.db_path = db_path
        self._conn: sqlite3.Connection | None = None

    def _get_conn(self) -> sqlite3.Connection:
        if self._conn is None:
            os.makedirs(os.path.dirname(os.path.abspath(self.db_path)), exist_ok=True)
            self._conn = sqlite3.connect(self.db_path, check_same_thread=False)
            self._conn.row_factory = sqlite3.Row
        return self._conn

    def __enter__(self) -> "SqliteStorage":
        self._get_conn()
        return self

    def __exit__(self, *args: object) -> None:
        self.close()

    def close(self) -> None:
        if self._conn:
            self._conn.close()
            self._conn = None

    def init_db(self) -> None:
        conn = self._get_conn()
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS crawl_runs (
                run_id TEXT PRIMARY KEY,
                brand TEXT,
                start_time TEXT,
                end_time TEXT,
                pages_crawled INTEGER DEFAULT 0,
                products_extracted INTEGER DEFAULT 0,
                markdown_docs INTEGER DEFAULT 0,
                exported_files TEXT DEFAULT '[]'
            );

            CREATE TABLE IF NOT EXISTS pages (
                id TEXT PRIMARY KEY,
                run_id TEXT,
                url TEXT,
                canonical_url TEXT,
                page_type TEXT,
                status_code INTEGER,
                fetched_at TEXT,
                render_mode TEXT,
                html_size INTEGER,
                extracted_at TEXT,
                FOREIGN KEY (run_id) REFERENCES crawl_runs(run_id)
            );

            CREATE TABLE IF NOT EXISTS products (
                id TEXT PRIMARY KEY,
                run_id TEXT,
                brand TEXT,
                source_url TEXT,
                product_name TEXT,
                price_current REAL,
                currency TEXT,
                availability TEXT,
                data_json TEXT,
                extracted_at TEXT,
                FOREIGN KEY (run_id) REFERENCES crawl_runs(run_id)
            );

            CREATE TABLE IF NOT EXISTS errors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                run_id TEXT,
                url TEXT,
                error_type TEXT,
                message TEXT,
                timestamp TEXT,
                FOREIGN KEY (run_id) REFERENCES crawl_runs(run_id)
            );

            CREATE INDEX IF NOT EXISTS idx_pages_run_id ON pages(run_id);
            CREATE INDEX IF NOT EXISTS idx_products_run_id ON products(run_id);
            CREATE INDEX IF NOT EXISTS idx_errors_run_id ON errors(run_id);
        """)
        conn.commit()

    async def _run_in_executor(self, func, *args):
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, func, *args)

    def _save_run_sync(self, run_id: str, brand: str, start_time: datetime) -> None:
        conn = self._get_conn()
        conn.execute(
            """INSERT OR REPLACE INTO crawl_runs (run_id, brand, start_time)
               VALUES (?, ?, ?)""",
            (run_id, brand, start_time.isoformat()),
        )
        conn.commit()

    async def save_run(self, run_id: str, brand: str, start_time: datetime) -> None:
        await self._run_in_executor(self._save_run_sync, run_id, brand, start_time)

    def _save_page_sync(self, run_id: str, page: dict) -> None:
        conn = self._get_conn()
        conn.execute(
            """INSERT OR REPLACE INTO pages
               (id, run_id, url, canonical_url, page_type, status_code,
                fetched_at, render_mode, html_size, extracted_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                page.get("id", ""),
                run_id,
                page.get("url", ""),
                page.get("canonical_url", ""),
                str(page.get("page_type", "")),
                page.get("status_code", 0),
                page.get("fetched_at", ""),
                page.get("render_mode", "http"),
                page.get("html_size", 0),
                page.get("extracted_at", ""),
            ),
        )
        conn.commit()

    async def save_page(self, run_id: str, page: dict) -> None:
        await self._run_in_executor(self._save_page_sync, run_id, page)

    def _save_product_sync(self, run_id: str, product_data: dict) -> None:
        conn = self._get_conn()
        conn.execute(
            """INSERT OR REPLACE INTO products
               (id, run_id, brand, source_url, product_name, price_current,
                currency, availability, data_json, extracted_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                product_data.get("id", ""),
                run_id,
                product_data.get("brand", ""),
                product_data.get("source_url", ""),
                product_data.get("product_name", ""),
                product_data.get("price_current"),
                product_data.get("currency", ""),
                product_data.get("availability", ""),
                json.dumps(product_data),
                str(product_data.get("extracted_at", "")),
            ),
        )
        conn.commit()

    async def save_product(self, run_id: str, product_data: dict) -> None:
        await self._run_in_executor(self._save_product_sync, run_id, product_data)

    def _save_error_sync(self, run_id: str, url: str, error_type: str, message: str) -> None:
        conn = self._get_conn()
        conn.execute(
            """INSERT INTO errors (run_id, url, error_type, message, timestamp)
               VALUES (?, ?, ?, ?, ?)""",
            (run_id, url, error_type, message, datetime.now(tz=timezone.utc).isoformat()),
        )
        conn.commit()

    async def save_error(self, run_id: str, url: str, error_type: str, message: str) -> None:
        await self._run_in_executor(self._save_error_sync, run_id, url, error_type, message)

    def _get_crawled_urls_sync(self, run_id: str) -> list[str]:
        conn = self._get_conn()
        rows = conn.execute(
            "SELECT url FROM pages WHERE run_id = ?", (run_id,)
        ).fetchall()
        return [row["url"] for row in rows]

    async def get_crawled_urls(self, run_id: str) -> list[str]:
        return await self._run_in_executor(self._get_crawled_urls_sync, run_id)

    def _get_run_sync(self, run_id: str) -> Optional[dict]:
        conn = self._get_conn()
        row = conn.execute(
            "SELECT * FROM crawl_runs WHERE run_id = ?", (run_id,)
        ).fetchone()
        if row:
            return dict(row)
        return None

    async def get_run(self, run_id: str) -> Optional[dict]:
        return await self._run_in_executor(self._get_run_sync, run_id)
