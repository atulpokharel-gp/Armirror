"""Skill memory — reusable action sequences extracted from successful workflows."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Optional

from momobot.cognition.memory.base import MemoryStore
from momobot.schemas.memory import SkillRecord


class SkillMemory:
    """Persistent store for reusable skills."""

    def __init__(self, db_path: str) -> None:
        self._store = MemoryStore(db_path=db_path, table="skills")

    async def save_skill(
        self,
        name: str,
        description: str,
        action_sequence: list[dict],
        trigger_patterns: list[str] | None = None,
        tags: list[str] | None = None,
    ) -> SkillRecord:
        """Create and persist a new skill."""
        record = SkillRecord(
            skill_id=str(uuid.uuid4()),
            name=name,
            description=description,
            action_sequence=action_sequence,
            trigger_patterns=trigger_patterns or [],
            tags=tags or [],
        )
        await self._store.upsert(record.skill_id, record.model_dump())
        return record

    async def record_use(self, skill_id: str, success: bool) -> None:
        """Update usage count and success rate for a skill."""
        data = await self._store.get(skill_id)
        if data is None:
            return
        record = SkillRecord(**data)
        total = record.use_count + 1
        # Running exponential moving average of success rate
        alpha = 0.2
        new_rate = (1.0 - alpha) * record.success_rate + alpha * (1.0 if success else 0.0)
        record.use_count = total
        record.success_rate = round(new_rate, 4)
        record.updated_at = datetime.now(timezone.utc)
        await self._store.upsert(skill_id, record.model_dump())

    async def get_relevant(self, tags: list[str], limit: int = 5) -> list[SkillRecord]:
        """Retrieve skills matching any of the provided tags, ordered by success rate."""
        seen: dict[str, SkillRecord] = {}
        for tag in tags:
            raw = await self._store.search_by_tag(tag, limit=limit * 2)
            for r in raw:
                sr = SkillRecord(**r)
                seen[sr.skill_id] = sr
        ranked = sorted(seen.values(), key=lambda s: s.success_rate, reverse=True)
        return ranked[:limit]

    async def list_all(self, limit: int = 50) -> list[SkillRecord]:
        raw = await self._store.list_recent(limit=limit)
        return [SkillRecord(**r) for r in raw]

    async def get(self, skill_id: str) -> Optional[SkillRecord]:
        data = await self._store.get(skill_id)
        return SkillRecord(**data) if data else None

    async def delete(self, skill_id: str) -> None:
        await self._store.delete(skill_id)

    async def close(self) -> None:
        await self._store.close()
