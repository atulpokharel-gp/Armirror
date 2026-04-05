"""Pydantic schemas for MomoBot observations."""

from __future__ import annotations

import base64
from datetime import datetime, timezone
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class WindowInfo(BaseModel):
    """Active window/application state."""

    title: str
    app_name: str
    pid: Optional[int] = None
    geometry: Optional[dict[str, int]] = None  # x, y, width, height
    is_focused: bool = True


class SystemMetrics(BaseModel):
    """OS-level performance snapshot."""

    cpu_percent: float
    memory_percent: float
    disk_percent: float
    active_processes: int
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ScreenCapture(BaseModel):
    """A single captured screen frame."""

    width: int
    height: int
    # Base64-encoded PNG bytes
    image_b64: str
    # OCR-extracted text (may be empty if OCR is disabled)
    ocr_text: str = ""
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    @classmethod
    def from_bytes(cls, raw: bytes, width: int, height: int, ocr_text: str = "") -> "ScreenCapture":
        return cls(
            width=width,
            height=height,
            image_b64=base64.b64encode(raw).decode(),
            ocr_text=ocr_text,
        )

    def to_bytes(self) -> bytes:
        return base64.b64decode(self.image_b64)


class CameraFrame(BaseModel):
    """Optional camera frame capture."""

    width: int
    height: int
    image_b64: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    @classmethod
    def from_bytes(cls, raw: bytes, width: int, height: int) -> "CameraFrame":
        return cls(width=width, height=height, image_b64=base64.b64encode(raw).decode())

    def to_bytes(self) -> bytes:
        return base64.b64decode(self.image_b64)


class AudioClip(BaseModel):
    """Optional audio capture and transcription."""

    duration_seconds: float
    sample_rate: int = 16000
    # Raw audio bytes as base64 (PCM float32 mono)
    audio_b64: str = ""
    transcript: str = ""
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ObservationBundle(BaseModel):
    """Full multimodal observation collected during one agent tick."""

    screen: ScreenCapture
    window: WindowInfo
    system: SystemMetrics
    camera: Optional[CameraFrame] = None
    audio: Optional[AudioClip] = None
    # LLM-generated structured description of the screen state
    vision_summary: str = ""
    tick_id: str = ""
    goal: str = ""
