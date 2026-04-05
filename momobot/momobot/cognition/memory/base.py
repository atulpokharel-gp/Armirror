"""Base memory interface backed by an async SQLite database."""

from __future__ import annotations

import json
import logging
from typing import Any

logger = logging.getLogger(__name__)

try:
    import aiosqlite

    _AIOSQLITE_AVAILABLE = True
except ImportError:  # pragma: no cover
    _AIOSQLITE_AVAILABLE = False


class MemoryStore:
    """Simple async key-value + query store backed by SQLite.

    Each concrete memory type (workflow, skill, failure) uses a dedicated
    table inside the same database file.
    """

    def __init__(self, db_path: str, table: str) -> None:
        self._db_path = db_path
        self._table = table
        self._conn: Any = None

    async def _ensure_connected(self) -> None:
        if self._conn is None:
            if not _AIOSQLITE_AVAILABLE:
                raise RuntimeError("aiosqlite is not installed. Run: pip install aiosqlite")
            self._conn = await aiosqlite.connect(self._db_path)
            await self._conn.execute(
                f"""
                CREATE TABLE IF NOT EXISTS {self._table} (
                    id TEXT PRIMARY KEY,
                    data TEXT NOT NULL,
                    tags TEXT NOT NULL DEFAULT '[]',
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
                """
            )
            await self._conn.execute(
                f"CREATE INDEX IF NOT EXISTS idx_{self._table}_tags ON {self._table}(tags)"
            )
            await self._conn.commit()

    async def upsert(self, record_id: str, data: dict[str, Any]) -> None:
        """Insert or replace a record by ID."""
        await self._ensure_connected()
        tags = json.dumps(data.get("tags", []))
        now = data.get("updated_at") or data.get("created_at") or ""
        if hasattr(now, "isoformat"):
            now = now.isoformat()
        created = data.get("started_at") or data.get("created_at") or now
        if hasattr(created, "isoformat"):
            created = created.isoformat()
        payload = json.dumps(data, default=str)
        await self._conn.execute(
            f"""
            INSERT INTO {self._table} (id, data, tags, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET data=excluded.data,
                                          tags=excluded.tags,
                                          updated_at=excluded.updated_at
            """,
            (record_id, payload, tags, created, now),
        )
        await self._conn.commit()

    async def get(self, record_id: str) -> dict[str, Any] | None:
        """Fetch a single record by ID."""
        await self._ensure_connected()
        async with self._conn.execute(
            f"SELECT data FROM {self._table} WHERE id = ?", (record_id,)
        ) as cursor:
            row = await cursor.fetchone()
        return json.loads(row[0]) if row else None

    async def list_recent(self, limit: int = 20) -> list[dict[str, Any]]:
        """Return the most recently updated records."""
        await self._ensure_connected()
        async with self._conn.execute(
            f"SELECT data FROM {self._table} ORDER BY updated_at DESC LIMIT ?", (limit,)
        ) as cursor:
            rows = await cursor.fetchall()
        return [json.loads(r[0]) for r in rows]

    async def search_by_tag(self, tag: str, limit: int = 10) -> list[dict[str, Any]]:
        """Return records whose tags JSON array contains *tag* (substring match)."""
        await self._ensure_connected()
        async with self._conn.execute(
            f"SELECT data FROM {self._table} WHERE tags LIKE ? ORDER BY updated_at DESC LIMIT ?",
            (f'%"{tag}"%', limit),
        ) as cursor:
            rows = await cursor.fetchall()
        return [json.loads(r[0]) for r in rows]

    async def delete(self, record_id: str) -> None:
        """Delete a record by ID."""
        await self._ensure_connected()
        await self._conn.execute(f"DELETE FROM {self._table} WHERE id = ?", (record_id,))
        await self._conn.commit()

    async def close(self) -> None:
        """Close the database connection."""
        if self._conn is not None:
            await self._conn.close()
            self._conn = None
