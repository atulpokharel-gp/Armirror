"""Mouse control via pyautogui."""

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


def click(x: int, y: int, button: str = "left", clicks: int = 1) -> None:
    pg = _require_pyautogui()
    pg.click(x=x, y=y, button=button, clicks=clicks, interval=0.1)
    logger.debug("click(%d, %d, button=%s, clicks=%d)", x, y, button, clicks)


def double_click(x: int, y: int) -> None:
    pg = _require_pyautogui()
    pg.doubleClick(x=x, y=y)
    logger.debug("double_click(%d, %d)", x, y)


def right_click(x: int, y: int) -> None:
    pg = _require_pyautogui()
    pg.rightClick(x=x, y=y)
    logger.debug("right_click(%d, %d)", x, y)


def move(x: int, y: int, duration: float = 0.3) -> None:
    pg = _require_pyautogui()
    pg.moveTo(x=x, y=y, duration=duration)
    logger.debug("move(%d, %d)", x, y)


def drag(x1: int, y1: int, x2: int, y2: int, duration: float = 0.5) -> None:
    pg = _require_pyautogui()
    pg.moveTo(x1, y1, duration=0.2)
    pg.dragTo(x2, y2, duration=duration, button="left")
    logger.debug("drag(%d,%d -> %d,%d)", x1, y1, x2, y2)


def scroll(x: int, y: int, amount: int = 3) -> None:
    """Scroll at (x, y). Positive amount scrolls up, negative scrolls down."""
    pg = _require_pyautogui()
    pg.moveTo(x=x, y=y)
    pg.scroll(amount)
    logger.debug("scroll(%d, %d, amount=%d)", x, y, amount)
