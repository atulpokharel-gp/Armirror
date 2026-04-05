"""Failure memory — records errors, unexpected states, and applied corrections."""

from __future__ import annotations

import uuid
from typing import Optional

from momobot.cognition.memory.base import MemoryStore
from momobot.schemas.memory import FailureRecord


class FailureMemory:
    """Persistent store for failure events and corrections."""

    def __init__(self, db_path: str) -> None:
        self._store = MemoryStore(db_path=db_path, table="failures")

    async def record_failure(
        self,
        goal: str,
        screen_summary: str,
        window_title: str,
        action_type: str,
        action_params: dict,
        error_message: str,
        tags: list[str] | None = None,
    ) -> FailureRecord:
        """Persist a new failure event."""
        record = FailureRecord(
            failure_id=str(uuid.uuid4()),
            goal=goal,
            screen_summary=screen_summary,
            window_title=window_title,
            action_type=action_type,
            action_params=action_params,
            error_message=error_message,
            tags=tags or [],
        )
        await self._store.upsert(record.failure_id, record.model_dump())
        return record

    async def add_correction(self, failure_id: str, correction: str) -> None:
        """Attach a human or agent correction to a failure record."""
        data = await self._store.get(failure_id)
        if data is None:
            return
        record = FailureRecord(**data)
        record.correction = correction
        record.resolved = True
        await self._store.upsert(failure_id, record.model_dump())

    async def get_similar(
        self, action_type: str, limit: int = 5
    ) -> list[FailureRecord]:
        """Retrieve recent failures with the same action type (tag-based)."""
        raw = await self._store.search_by_tag(action_type, limit=limit)
        return [FailureRecord(**r) for r in raw]

    async def get_recent(self, limit: int = 10) -> list[FailureRecord]:
        raw = await self._store.list_recent(limit=limit)
        return [FailureRecord(**r) for r in raw]

    async def get(self, failure_id: str) -> Optional[FailureRecord]:
        data = await self._store.get(failure_id)
        return FailureRecord(**data) if data else None

    async def close(self) -> None:
        await self._store.close()
