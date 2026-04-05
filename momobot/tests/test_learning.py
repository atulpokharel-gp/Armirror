"""Tests for the learning system."""

from __future__ import annotations

from pathlib import Path

import pytest

from momobot.cognition.mesh import CognitionMesh
from momobot.learning.learner import LearningSystem
from momobot.schemas.action import ActionParameters, ActionResult, ActionType, PlannedAction
from momobot.schemas.memory import WorkflowStep


@pytest.fixture
def db_path(tmp_path: Path) -> str:
    return str(tmp_path / "learning.db")


def _make_result(action_type: ActionType = ActionType.CLICK, success: bool = True) -> ActionResult:
    action = PlannedAction(action_type=action_type, parameters=ActionParameters(x=10, y=10))
    return ActionResult(action=action, success=success, verified=success)


class TestLearningSystem:
    @pytest.mark.asyncio
    async def test_record_tick_success(self, db_path: str) -> None:
        mesh = CognitionMesh(db_path=db_path)
        learner = LearningSystem(mesh)
        await mesh.begin_goal("test goal")
        result = _make_result(ActionType.CLICK, success=True)
        await learner.record_tick(
            tick_id="t1",
            goal="test goal",
            screen_summary="desktop",
            window_title="Terminal",
            result=result,
        )
        wf = await mesh.workflow_memory.get(mesh.current_workflow_id)
        assert wf is not None
        assert len(wf.steps) == 1
        await mesh.close()

    @pytest.mark.asyncio
    async def test_record_tick_failure_creates_failure_record(self, db_path: str) -> None:
        mesh = CognitionMesh(db_path=db_path)
        learner = LearningSystem(mesh)
        await mesh.begin_goal("fail goal")
        result = _make_result(ActionType.CLICK, success=False)
        result = result.model_copy(update={"error_message": "element not found"})
        await learner.record_tick(
            tick_id="t2",
            goal="fail goal",
            screen_summary="error page",
            window_title="App",
            result=result,
        )
        failures = await mesh.failure_memory.get_recent(limit=5)
        assert any(f.error_message == "element not found" for f in failures)
        await mesh.close()

    @pytest.mark.asyncio
    async def test_skill_extracted_from_successful_workflow(self, db_path: str) -> None:
        mesh = CognitionMesh(db_path=db_path)
        learner = LearningSystem(mesh)
        wf = await mesh.begin_goal("successful workflow")
        workflow_id = wf.workflow_id

        # Add enough successful verified steps
        for i in range(4):
            step = WorkflowStep(
                tick_id=f"t{i}",
                goal="successful workflow",
                screen_summary="desktop",
                window_title="Terminal",
                action_type=ActionType.CLICK.value,
                action_params={"x": i * 10, "y": 20},
                reasoning=f"step {i}",
                success=True,
                verified=True,
            )
            await mesh.record_step(step)

        await mesh.finish_goal(status="completed", outcome_summary="all good")
        skill_id = await learner.on_workflow_complete(
            workflow_id=workflow_id,
            status="completed",
            outcome_summary="all good",
        )
        assert skill_id is not None
        skill = await mesh.skill_memory.get(skill_id)
        assert skill is not None
        assert "successful workflow" in skill.name
        await mesh.close()

    @pytest.mark.asyncio
    async def test_no_skill_for_failed_workflow(self, db_path: str) -> None:
        mesh = CognitionMesh(db_path=db_path)
        learner = LearningSystem(mesh)
        wf = await mesh.begin_goal("failed workflow")
        workflow_id = wf.workflow_id
        await mesh.finish_goal(status="failed", outcome_summary="crashed")
        skill_id = await learner.on_workflow_complete(
            workflow_id=workflow_id,
            status="failed",
            outcome_summary="crashed",
        )
        assert skill_id is None
        await mesh.close()
