"""Tests for Pydantic schemas."""

import base64
from datetime import datetime

import pytest

from momobot.schemas.observation import (
    AudioClip,
    CameraFrame,
    ObservationBundle,
    ScreenCapture,
    SystemMetrics,
    WindowInfo,
)
from momobot.schemas.action import ActionParameters, ActionType, PlannedAction, ActionResult
from momobot.schemas.memory import (
    FailureRecord,
    SkillRecord,
    WorkflowRecord,
    WorkflowStep,
)


class TestScreenCapture:
    def test_from_bytes_roundtrip(self) -> None:
        raw = b"\x89PNG fake bytes"
        sc = ScreenCapture.from_bytes(raw, width=1920, height=1080, ocr_text="hello")
        assert sc.width == 1920
        assert sc.height == 1080
        assert sc.ocr_text == "hello"
        assert sc.to_bytes() == raw

    def test_defaults(self) -> None:
        sc = ScreenCapture(width=800, height=600, image_b64="abc")
        assert sc.ocr_text == ""
        assert isinstance(sc.timestamp, datetime)


class TestWindowInfo:
    def test_basic(self) -> None:
        wi = WindowInfo(title="VS Code", app_name="code")
        assert wi.is_focused is True
        assert wi.geometry is None


class TestSystemMetrics:
    def test_values(self) -> None:
        sm = SystemMetrics(cpu_percent=25.0, memory_percent=60.0, disk_percent=40.0, active_processes=120)
        assert 0 <= sm.cpu_percent <= 100
        assert isinstance(sm.timestamp, datetime)


class TestPlannedAction:
    def test_defaults(self) -> None:
        action = PlannedAction(action_type=ActionType.CLICK)
        assert action.confidence == 1.0
        assert action.is_destructive is False
        assert action.requires_confirmation is False

    def test_parameters(self) -> None:
        params = ActionParameters(x=100, y=200, button="right")
        action = PlannedAction(action_type=ActionType.RIGHT_CLICK, parameters=params)
        assert action.parameters.x == 100
        assert action.parameters.button == "right"


class TestActionResult:
    def test_success(self) -> None:
        action = PlannedAction(action_type=ActionType.WAIT)
        result = ActionResult(action=action, success=True)
        assert result.verified is False  # not yet verified
        assert result.error_message == ""


class TestWorkflowRecord:
    def test_defaults(self) -> None:
        wf = WorkflowRecord(workflow_id="abc", goal="test goal")
        assert wf.status == "in_progress"
        assert wf.steps == []
        assert wf.use_count == 0

    def test_with_steps(self) -> None:
        step = WorkflowStep(
            tick_id="t1",
            goal="test",
            screen_summary="desktop",
            window_title="Terminal",
            action_type="click",
            action_params={"x": 10, "y": 20},
            reasoning="test reason",
            success=True,
            verified=True,
        )
        wf = WorkflowRecord(workflow_id="wf1", goal="test goal", steps=[step])
        assert len(wf.steps) == 1
        assert wf.steps[0].action_type == "click"


class TestSkillRecord:
    def test_defaults(self) -> None:
        skill = SkillRecord(
            skill_id="s1",
            name="Open browser",
            description="Opens the browser",
            action_sequence=[{"action_type": "open_app", "parameters": {"app_name": "firefox"}}],
        )
        assert skill.success_rate == 1.0
        assert skill.use_count == 0


class TestFailureRecord:
    def test_defaults(self) -> None:
        f = FailureRecord(
            failure_id="f1",
            goal="click submit",
            screen_summary="form visible",
            window_title="Chrome",
            action_type="click",
            action_params={"x": 0, "y": 0},
            error_message="Element not found",
        )
        assert f.resolved is False
        assert f.correction is None
