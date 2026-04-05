"""Tests for the memory stores (using a temp SQLite file)."""

from __future__ import annotations

import os
import tempfile
from pathlib import Path

import pytest

from momobot.cognition.memory.workflow import WorkflowMemory
from momobot.cognition.memory.skill import SkillMemory
from momobot.cognition.memory.failure import FailureMemory
from momobot.schemas.memory import WorkflowStep


@pytest.fixture
def db_path(tmp_path: Path) -> str:
    return str(tmp_path / "test.db")


class TestWorkflowMemory:
    @pytest.mark.asyncio
    async def test_start_and_get(self, db_path: str) -> None:
        mem = WorkflowMemory(db_path)
        record = await mem.start_workflow("Search the web", tags=["browser"])
        assert record.workflow_id
        assert record.status == "in_progress"

        fetched = await mem.get(record.workflow_id)
        assert fetched is not None
        assert fetched.goal == "Search the web"
        await mem.close()

    @pytest.mark.asyncio
    async def test_add_step_and_complete(self, db_path: str) -> None:
        mem = WorkflowMemory(db_path)
        record = await mem.start_workflow("Fill form")
        step = WorkflowStep(
            tick_id="t1",
            goal="Fill form",
            screen_summary="form page",
            window_title="Chrome",
            action_type="click",
            action_params={"x": 100, "y": 200},
            reasoning="click the input field",
            success=True,
            verified=True,
        )
        await mem.add_step(record.workflow_id, step)
        await mem.complete_workflow(record.workflow_id, status="completed", outcome_summary="done")

        fetched = await mem.get(record.workflow_id)
        assert fetched is not None
        assert fetched.status == "completed"
        assert len(fetched.steps) == 1
        assert fetched.use_count == 1
        await mem.close()

    @pytest.mark.asyncio
    async def test_get_recent(self, db_path: str) -> None:
        mem = WorkflowMemory(db_path)
        for i in range(5):
            await mem.start_workflow(f"Goal {i}")
        recent = await mem.get_recent(limit=3)
        assert len(recent) == 3
        await mem.close()


class TestSkillMemory:
    @pytest.mark.asyncio
    async def test_save_and_list(self, db_path: str) -> None:
        mem = SkillMemory(db_path)
        skill = await mem.save_skill(
            name="Open Chrome",
            description="Launches Chrome browser",
            action_sequence=[{"action_type": "open_app", "parameters": {"app_name": "chrome"}}],
            tags=["browser", "open_app"],
        )
        assert skill.skill_id

        all_skills = await mem.list_all()
        assert any(s.skill_id == skill.skill_id for s in all_skills)
        await mem.close()

    @pytest.mark.asyncio
    async def test_record_use_updates_rate(self, db_path: str) -> None:
        mem = SkillMemory(db_path)
        skill = await mem.save_skill(
            name="Test skill",
            description="desc",
            action_sequence=[],
        )
        # Record a failure
        await mem.record_use(skill.skill_id, success=False)
        updated = await mem.get(skill.skill_id)
        assert updated is not None
        assert updated.success_rate < 1.0
        assert updated.use_count == 1
        await mem.close()

    @pytest.mark.asyncio
    async def test_get_relevant_by_tag(self, db_path: str) -> None:
        mem = SkillMemory(db_path)
        await mem.save_skill("Skill A", "desc", [], tags=["browser"])
        await mem.save_skill("Skill B", "desc", [], tags=["terminal"])
        relevant = await mem.get_relevant(["browser"], limit=5)
        assert len(relevant) == 1
        assert relevant[0].name == "Skill A"
        await mem.close()

    @pytest.mark.asyncio
    async def test_delete(self, db_path: str) -> None:
        mem = SkillMemory(db_path)
        skill = await mem.save_skill("To delete", "desc", [])
        await mem.delete(skill.skill_id)
        fetched = await mem.get(skill.skill_id)
        assert fetched is None
        await mem.close()


class TestFailureMemory:
    @pytest.mark.asyncio
    async def test_record_and_correct(self, db_path: str) -> None:
        mem = FailureMemory(db_path)
        failure = await mem.record_failure(
            goal="click button",
            screen_summary="button visible",
            window_title="App",
            action_type="click",
            action_params={"x": 0, "y": 0},
            error_message="click timeout",
            tags=["click"],
        )
        assert failure.failure_id
        assert not failure.resolved

        await mem.add_correction(failure.failure_id, "Increase timeout")
        updated = await mem.get(failure.failure_id)
        assert updated is not None
        assert updated.resolved
        assert updated.correction == "Increase timeout"
        await mem.close()
