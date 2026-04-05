"""Post-action verification — compares pre/post screen state to detect success or failure."""

from __future__ import annotations

import logging
from typing import Optional

from momobot.observation.screen import diff_screens
from momobot.schemas.action import ActionResult, ActionType, PlannedAction
from momobot.schemas.observation import ScreenCapture

logger = logging.getLogger(__name__)

# Actions that should produce visible screen changes
_VISUAL_CHANGE_ACTIONS: frozenset[ActionType] = frozenset(
    {
        ActionType.CLICK,
        ActionType.DOUBLE_CLICK,
        ActionType.TYPE,
        ActionType.KEY_PRESS,
        ActionType.HOTKEY,
        ActionType.OPEN_APP,
        ActionType.CLOSE_APP,
        ActionType.FOCUS_WINDOW,
        ActionType.SWITCH_WINDOW,
    }
)

# Threshold above which we consider a screen "changed"
_CHANGE_THRESHOLD = 0.01  # 1% mean pixel difference


class ActionVerifier:
    """Verifies that an action produced the expected screen change.

    Strategy:
    - For actions that should visually change the screen, compare pre/post captures.
      A meaningful pixel diff (> threshold) is treated as a positive signal.
    - For wait/screenshot/clipboard/meta actions, always return verified=True.
    - If the action itself already failed (success=False), verification is skipped.
    """

    def __init__(self, change_threshold: float = _CHANGE_THRESHOLD) -> None:
        self._threshold = change_threshold

    def verify(
        self,
        result: ActionResult,
        before: ScreenCapture,
        after: ScreenCapture,
        vision_summary_after: str = "",
    ) -> ActionResult:
        """Return an updated ActionResult with verification fields set.

        Args:
            result: The raw ActionResult from the executor.
            before: Screen capture taken *before* the action.
            after: Screen capture taken *after* the action.
            vision_summary_after: Optional LLM description of the post-action screen.

        Returns:
            A new ActionResult with ``verified`` and ``verification_notes`` populated.
        """
        if not result.success:
            # Nothing to verify; execution itself failed
            return result.model_copy(
                update={"verified": False, "verification_notes": "Execution failed."}
            )

        action_type = result.action.action_type

        # Meta / non-visual actions — always pass
        if action_type in (
            ActionType.WAIT,
            ActionType.SCREENSHOT,
            ActionType.CLIPBOARD_COPY,
            ActionType.CLIPBOARD_PASTE,
            ActionType.ASK_HUMAN,
            ActionType.GOAL_COMPLETE,
            ActionType.GOAL_ABORT,
            ActionType.MOVE,
        ):
            return result.model_copy(
                update={"verified": True, "verification_notes": "Non-visual action — pass."}
            )

        # Visual actions: check pixel diff
        if action_type in _VISUAL_CHANGE_ACTIONS:
            diff = diff_screens(before, after)
            changed = diff > self._threshold
            notes = (
                f"Screen diff={diff:.4f} ({'changed' if changed else 'unchanged'}, "
                f"threshold={self._threshold}). {vision_summary_after}"
            )
            if not changed:
                logger.debug(
                    "Verification: screen unchanged after %s (diff=%.4f)",
                    action_type.value,
                    diff,
                )
            return result.model_copy(
                update={"verified": changed, "verification_notes": notes}
            )

        # Fallback
        return result.model_copy(
            update={"verified": True, "verification_notes": "No specific verification rule."}
        )
