"""Keyboard control via pyautogui."""

from __future__ import annotations

import logging
import time
from typing import Any

logger = logging.getLogger(__name__)

_pyautogui: Any = None


def _require_pyautogui() -> Any:
    global _pyautogui  # noqa: PLW0603
    if _pyautogui is None:
        try:
            import pyautogui as _pg  # type: ignore

            _pg.FAILSAFE = True
            _pg.PAUSE = 0.05
            _pyautogui = _pg
        except Exception as exc:
            raise RuntimeError(
                f"pyautogui is unavailable in this environment: {exc}. "
                "Ensure a display is attached and pyautogui is installed."
            ) from exc
    return _pyautogui


def type_text(text: str, interval: float = 0.03) -> None:
    """Type *text* with a small inter-character delay."""
    pg = _require_pyautogui()
    pg.write(text, interval=interval)
    logger.debug("type_text(len=%d)", len(text))


def press_key(key: str) -> None:
    """Press and release a single key (e.g. 'enter', 'tab', 'escape')."""
    pg = _require_pyautogui()
    pg.press(key)
    logger.debug("press_key(%r)", key)


def hotkey(*keys: str) -> None:
    """Press a keyboard shortcut (e.g. hotkey('ctrl', 'c'))."""
    pg = _require_pyautogui()
    pg.hotkey(*keys)
    logger.debug("hotkey(%s)", "+".join(keys))


def copy_to_clipboard(text: str) -> None:
    """Place *text* in the system clipboard via pyperclip (bundled with pyautogui)."""
    _require_pyautogui()  # ensure pyautogui env is valid
    try:
        import pyperclip  # type: ignore

        pyperclip.copy(text)
        logger.debug("clipboard_copy(len=%d)", len(text))
    except ImportError:
        logger.warning("pyperclip not available; clipboard_copy skipped.")


def paste_from_clipboard() -> None:
    """Paste clipboard contents at the current cursor position."""
    hotkey("ctrl", "v")
