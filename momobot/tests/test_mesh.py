"""Tests for the CognitionMesh."""

from __future__ import annotations

from pathlib import Path

import pytest

from momobot.cognition.mesh import CognitionMesh
from momobot.schemas.memory import WorkflowStep


@pytest.fixture
def db_path(tmp_path: Path) -> str:
    return str(tmp_path / "mesh.db")


class TestCognitionMesh:
    @pytest.mark.asyncio
    async def test_begin_and_finish_goal(self, db_path: str) -> None:
        mesh = CognitionMesh(db_path=db_path)
        record = await mesh.begin_goal("Open browser", tags=["browser"])
        assert mesh.current_goal == "Open browser"
        assert mesh.current_workflow_id == record.workflow_id

        await mesh.finish_goal(status="completed", outcome_summary="done")
        assert mesh.current_workflow_id is None
        await mesh.close()

    @pytest.mark.asyncio
    async def test_record_step(self, db_path: str) -> None:
        mesh = CognitionMesh(db_path=db_path)
        await mesh.begin_goal("Fill form")
        step = WorkflowStep(
            tick_id="t1",
            goal="Fill form",
            screen_summary="form visible",
            window_title="Firefox",
            action_type="type",
            action_params={"text": "hello"},
            reasoning="type in the field",
            success=True,
            verified=True,
        )
        await mesh.record_step(step)

        wf = await mesh.workflow_memory.get(mesh.current_workflow_id)
        assert wf is not None
        assert len(wf.steps) == 1
        await mesh.close()

    @pytest.mark.asyncio
    async def test_retrieve_context_empty(self, db_path: str) -> None:
        mesh = CognitionMesh(db_path=db_path)
        ctx = await mesh.retrieve_context(tags=["browser"])
        assert "skills" in ctx
        assert "recent_workflows" in ctx
        assert "recent_failures" in ctx
        assert ctx["skills"] == []
        await mesh.close()

    @pytest.mark.asyncio
    async def test_retrieve_context_with_skill(self, db_path: str) -> None:
        mesh = CognitionMesh(db_path=db_path)
        await mesh.skill_memory.save_skill(
            name="Open Firefox",
            description="Opens Firefox",
            action_sequence=[],
            tags=["browser"],
        )
        ctx = await mesh.retrieve_context(tags=["browser"])
        assert len(ctx["skills"]) == 1
        assert ctx["skills"][0]["name"] == "Open Firefox"
        await mesh.close()
