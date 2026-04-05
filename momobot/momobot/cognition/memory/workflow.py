"""Workflow memory — stores and retrieves multi-step workflow traces."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any, Optional

from momobot.cognition.memory.base import MemoryStore
from momobot.schemas.memory import WorkflowRecord, WorkflowStep


class WorkflowMemory:
    """Persistent store for workflow traces."""

    def __init__(self, db_path: str) -> None:
        self._store = MemoryStore(db_path=db_path, table="workflows")

    async def start_workflow(self, goal: str, tags: list[str] | None = None) -> WorkflowRecord:
        """Create and persist a new in-progress workflow."""
        record = WorkflowRecord(
            workflow_id=str(uuid.uuid4()),
            goal=goal,
            status="in_progress",
            tags=tags or [],
        )
        await self._store.upsert(record.workflow_id, record.model_dump())
        return record

    async def add_step(self, workflow_id: str, step: WorkflowStep) -> None:
        """Append a step to an existing workflow record."""
        data = await self._store.get(workflow_id)
        if data is None:
            return
        record = WorkflowRecord(**data)
        record.steps.append(step)
        await self._store.upsert(workflow_id, record.model_dump())

    async def complete_workflow(
        self,
        workflow_id: str,
        status: str = "completed",
        outcome_summary: str = "",
    ) -> None:
        """Mark a workflow as completed/failed/aborted."""
        data = await self._store.get(workflow_id)
        if data is None:
            return
        record = WorkflowRecord(**data)
        record.status = status
        record.outcome_summary = outcome_summary
        record.ended_at = datetime.now(timezone.utc)
        record.use_count += 1
        await self._store.upsert(workflow_id, record.model_dump())

    async def get_recent(self, limit: int = 10) -> list[WorkflowRecord]:
        """Return the most recently updated workflow traces."""
        raw = await self._store.list_recent(limit=limit)
        return [WorkflowRecord(**r) for r in raw]

    async def search(self, tag: str, limit: int = 5) -> list[WorkflowRecord]:
        """Find workflows by tag."""
        raw = await self._store.search_by_tag(tag, limit=limit)
        return [WorkflowRecord(**r) for r in raw]

    async def get(self, workflow_id: str) -> Optional[WorkflowRecord]:
        data = await self._store.get(workflow_id)
        return WorkflowRecord(**data) if data else None

    async def close(self) -> None:
        await self._store.close()
