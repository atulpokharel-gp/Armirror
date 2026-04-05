"""Active window and application state detection (cross-platform)."""

from __future__ import annotations

import logging
import subprocess
import sys
from typing import Optional

from momobot.schemas.observation import WindowInfo

logger = logging.getLogger(__name__)


def _get_active_window_linux() -> Optional[WindowInfo]:
    """Use xdotool / wmctrl on Linux to get the focused window."""
    try:
        # xdotool getactivewindow getwindowname
        title = subprocess.check_output(
            ["xdotool", "getactivewindow", "getwindowname"],
            stderr=subprocess.DEVNULL,
            timeout=2,
        ).decode().strip()

        # Get window PID
        pid_raw = subprocess.check_output(
            ["xdotool", "getactivewindow", "getwindowpid"],
            stderr=subprocess.DEVNULL,
            timeout=2,
        ).decode().strip()
        pid = int(pid_raw) if pid_raw.isdigit() else None

        # Derive app name from process name
        app_name = title
        if pid:
            try:
                proc_name = subprocess.check_output(
                    ["ps", "-p", str(pid), "-o", "comm="],
                    stderr=subprocess.DEVNULL,
                    timeout=2,
                ).decode().strip()
                app_name = proc_name if proc_name else title
            except Exception:  # noqa: BLE001
                pass

        return WindowInfo(title=title, app_name=app_name, pid=pid)
    except Exception as exc:  # noqa: BLE001
        logger.debug("Linux window detection failed: %s", exc)
        return None


def _get_active_window_macos() -> Optional[WindowInfo]:
    """Use AppleScript on macOS to get the frontmost app and window title."""
    try:
        script = (
            'tell application "System Events" to get name of first application process '
            "whose frontmost is true"
        )
        app_name = subprocess.check_output(
            ["osascript", "-e", script],
            stderr=subprocess.DEVNULL,
            timeout=3,
        ).decode().strip()

        title_script = (
            f'tell application "{app_name}" to get name of front window'
        )
        try:
            title = subprocess.check_output(
                ["osascript", "-e", title_script],
                stderr=subprocess.DEVNULL,
                timeout=3,
            ).decode().strip()
        except Exception:  # noqa: BLE001
            title = app_name

        return WindowInfo(title=title, app_name=app_name)
    except Exception as exc:  # noqa: BLE001
        logger.debug("macOS window detection failed: %s", exc)
        return None


def _get_active_window_windows() -> Optional[WindowInfo]:
    """Use pygetwindow on Windows to get the active window."""
    try:
        import pygetwindow as gw  # type: ignore

        win = gw.getActiveWindow()
        if win is None:
            return None
        return WindowInfo(
            title=win.title,
            app_name=win.title,
            geometry={"x": win.left, "y": win.top, "width": win.width, "height": win.height},
        )
    except Exception as exc:  # noqa: BLE001
        logger.debug("Windows window detection failed: %s", exc)
        return None


def get_active_window() -> WindowInfo:
    """Return the currently focused window/application state.

    Falls back to a placeholder if detection is unavailable on the current platform.
    """
    info: Optional[WindowInfo] = None

    if sys.platform.startswith("linux"):
        info = _get_active_window_linux()
    elif sys.platform == "darwin":
        info = _get_active_window_macos()
    elif sys.platform == "win32":
        info = _get_active_window_windows()

    if info is None:
        info = WindowInfo(title="Unknown", app_name="Unknown")

    return info
