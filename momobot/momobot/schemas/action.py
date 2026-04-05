"""Pydantic schemas for MomoBot actions."""

from __future__ import annotations

from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, Field


class ActionType(str, Enum):
    """All action types the agent can emit."""

    # Mouse
    CLICK = "click"
    RIGHT_CLICK = "right_click"
    DOUBLE_CLICK = "double_click"
    MOVE = "move"
    DRAG = "drag"
    SCROLL = "scroll"

    # Keyboard
    TYPE = "type"
    KEY_PRESS = "key_press"
    HOTKEY = "hotkey"

    # Application control
    OPEN_APP = "open_app"
    CLOSE_APP = "close_app"
    FOCUS_WINDOW = "focus_window"
    SWITCH_WINDOW = "switch_window"

    # System
    WAIT = "wait"
    SCREENSHOT = "screenshot"
    CLIPBOARD_COPY = "clipboard_copy"
    CLIPBOARD_PASTE = "clipboard_paste"

    # Agent meta
    ASK_HUMAN = "ask_human"
    GOAL_COMPLETE = "goal_complete"
    GOAL_ABORT = "goal_abort"


class ActionParameters(BaseModel):
    """Parameters for a single action — all fields optional, used by type."""

    # Mouse targets
    x: Optional[int] = None
    y: Optional[int] = None
    x2: Optional[int] = None
    y2: Optional[int] = None
    button: str = "left"
    clicks: int = 1
    scroll_amount: int = 3

    # Keyboard
    text: Optional[str] = None
    key: Optional[str] = None
    hotkeys: list[str] = Field(default_factory=list)

    # App control
    app_name: Optional[str] = None
    app_path: Optional[str] = None
    window_title: Optional[str] = None

    # Wait
    duration_seconds: float = 0.5

    # Clipboard
    content: Optional[str] = None

    # Human message
    message: Optional[str] = None

    # Extra context passed through but not executed
    extra: dict[str, Any] = Field(default_factory=dict)


class PlannedAction(BaseModel):
    """A single action selected by the decision engine."""

    action_type: ActionType
    parameters: ActionParameters = Field(default_factory=ActionParameters)
    reasoning: str = ""
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    requires_confirmation: bool = False
    is_destructive: bool = False


class ActionResult(BaseModel):
    """Outcome of executing a PlannedAction."""

    action: PlannedAction
    success: bool
    error_message: str = ""
    # Duration of execution in seconds
    duration_seconds: float = 0.0
    # Whether the post-action verification passed
    verified: bool = False
    verification_notes: str = ""
