"""Tests for the verification layer."""

from __future__ import annotations

import base64
import io

import pytest
from PIL import Image

from momobot.schemas.action import ActionParameters, ActionResult, ActionType, PlannedAction
from momobot.schemas.observation import ScreenCapture
from momobot.verification.verifier import ActionVerifier


def _make_screen(color: tuple[int, int, int] = (255, 255, 255)) -> ScreenCapture:
    """Create a tiny solid-color PNG ScreenCapture for testing."""
    img = Image.new("RGB", (160, 90), color=color)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    raw = buf.getvalue()
    return ScreenCapture.from_bytes(raw, width=160, height=90)


class TestActionVerifier:
    def setup_method(self) -> None:
        self.verifier = ActionVerifier(change_threshold=0.01)

    def _make_result(self, action_type: ActionType, success: bool = True) -> ActionResult:
        action = PlannedAction(action_type=action_type, parameters=ActionParameters(x=10, y=10))
        return ActionResult(action=action, success=success)

    def test_failed_action_not_verified(self) -> None:
        result = self._make_result(ActionType.CLICK, success=False)
        before = _make_screen((255, 255, 255))
        after = _make_screen((0, 0, 0))
        out = self.verifier.verify(result, before, after)
        assert out.verified is False
        assert "Execution failed" in out.verification_notes

    def test_wait_action_always_verified(self) -> None:
        result = self._make_result(ActionType.WAIT)
        screen = _make_screen()
        out = self.verifier.verify(result, screen, screen)
        assert out.verified is True

    def test_click_with_visual_change_verified(self) -> None:
        result = self._make_result(ActionType.CLICK)
        before = _make_screen((255, 255, 255))
        after = _make_screen((0, 0, 0))  # completely different
        out = self.verifier.verify(result, before, after)
        assert out.verified is True

    def test_click_without_visual_change_not_verified(self) -> None:
        result = self._make_result(ActionType.CLICK)
        before = _make_screen((128, 128, 128))
        after = _make_screen((128, 128, 128))  # same
        out = self.verifier.verify(result, before, after)
        assert out.verified is False

    def test_meta_actions_always_verified(self) -> None:
        for at in (ActionType.GOAL_COMPLETE, ActionType.ASK_HUMAN, ActionType.SCREENSHOT):
            result = self._make_result(at)
            screen = _make_screen()
            out = self.verifier.verify(result, screen, screen)
            assert out.verified is True
