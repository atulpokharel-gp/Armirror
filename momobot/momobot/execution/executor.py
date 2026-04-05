"""Unified action executor — dispatches PlannedActions to mouse/keyboard/app control."""

from __future__ import annotations

import logging
import subprocess
import time
from typing import Optional

from momobot.execution import keyboard, mouse
from momobot.schemas.action import ActionResult, ActionType, PlannedAction

logger = logging.getLogger(__name__)


class ActionExecutor:
    """Executes PlannedActions and returns ActionResult."""

    def __init__(self, allow_destructive: bool = False) -> None:
        self._allow_destructive = allow_destructive

    def execute(self, action: PlannedAction) -> ActionResult:
        """Dispatch *action* to the appropriate handler.

        Returns an ActionResult with success/error information.
        Never raises.
        """
        # Safety gate: refuse destructive actions unless policy allows them
        if action.is_destructive and not self._allow_destructive:
            return ActionResult(
                action=action,
                success=False,
                error_message="Destructive action blocked by policy (allow_destructive=False).",
            )

        start = time.monotonic()
        error = ""
        success = False

        try:
            self._dispatch(action)
            success = True
        except Exception as exc:  # noqa: BLE001
            error = str(exc)
            logger.warning("Action %s failed: %s", action.action_type.value, exc)

        duration = time.monotonic() - start
        return ActionResult(
            action=action,
            success=success,
            error_message=error,
            duration_seconds=round(duration, 3),
        )

    def _dispatch(self, action: PlannedAction) -> None:  # noqa: C901
        p = action.parameters
        t = action.action_type

        if t == ActionType.CLICK:
            mouse.click(p.x or 0, p.y or 0, button=p.button, clicks=p.clicks)

        elif t == ActionType.RIGHT_CLICK:
            mouse.right_click(p.x or 0, p.y or 0)

        elif t == ActionType.DOUBLE_CLICK:
            mouse.double_click(p.x or 0, p.y or 0)

        elif t == ActionType.MOVE:
            mouse.move(p.x or 0, p.y or 0)

        elif t == ActionType.DRAG:
            mouse.drag(p.x or 0, p.y or 0, p.x2 or 0, p.y2 or 0)

        elif t == ActionType.SCROLL:
            mouse.scroll(p.x or 0, p.y or 0, amount=p.scroll_amount)

        elif t == ActionType.TYPE:
            if p.text:
                keyboard.type_text(p.text)

        elif t == ActionType.KEY_PRESS:
            if p.key:
                keyboard.press_key(p.key)

        elif t == ActionType.HOTKEY:
            if p.hotkeys:
                keyboard.hotkey(*p.hotkeys)

        elif t == ActionType.OPEN_APP:
            self._open_app(p.app_path or p.app_name or "")

        elif t == ActionType.CLOSE_APP:
            self._close_app(p.app_name or "")

        elif t == ActionType.FOCUS_WINDOW:
            self._focus_window(p.window_title or "")

        elif t == ActionType.SWITCH_WINDOW:
            keyboard.hotkey("alt", "tab")

        elif t == ActionType.WAIT:
            time.sleep(p.duration_seconds)

        elif t == ActionType.SCREENSHOT:
            pass  # Observation layer handles screenshots; this is a no-op action

        elif t == ActionType.CLIPBOARD_COPY:
            if p.content:
                keyboard.copy_to_clipboard(p.content)

        elif t == ActionType.CLIPBOARD_PASTE:
            keyboard.paste_from_clipboard()

        elif t in (ActionType.ASK_HUMAN, ActionType.GOAL_COMPLETE, ActionType.GOAL_ABORT):
            pass  # These are meta-actions handled by the agent loop

        else:
            logger.warning("Unknown action type: %s", t)

    # ------------------------------------------------------------------
    # App control helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _open_app(identifier: str) -> None:
        """Launch an application by path or name (cross-platform best-effort)."""
        if not identifier:
            return
        import sys

        if sys.platform == "win32":
            subprocess.Popen(["start", identifier], shell=True)
        elif sys.platform == "darwin":
            subprocess.Popen(["open", "-a", identifier])
        else:
            subprocess.Popen([identifier])
        time.sleep(1.5)  # give the app a moment to open

    @staticmethod
    def _close_app(app_name: str) -> None:
        """Close an application by name (best-effort, Linux/macOS)."""
        if not app_name:
            return
        import sys

        if sys.platform == "darwin":
            subprocess.call(["osascript", "-e", f'quit app "{app_name}"'])
        elif sys.platform.startswith("linux"):
            subprocess.call(["pkill", "-f", app_name])
        # Windows: not implemented — would need win32api

    @staticmethod
    def _focus_window(window_title: str) -> None:
        """Attempt to bring a window to focus by title (Linux/macOS)."""
        if not window_title:
            return
        import sys

        if sys.platform.startswith("linux"):
            try:
                subprocess.call(
                    ["xdotool", "search", "--name", window_title, "windowactivate"],
                    timeout=3,
                )
            except Exception:  # noqa: BLE001
                pass
        elif sys.platform == "darwin":
            script = (
                f'tell application "{window_title}" to activate'
            )
            try:
                subprocess.call(["osascript", "-e", script], timeout=3)
            except Exception:  # noqa: BLE001
                pass
