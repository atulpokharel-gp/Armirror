"""Observation layer package.

Assembles all sensor inputs into a single ObservationBundle.
"""

from __future__ import annotations

import uuid
from typing import Optional

from momobot.observation.audio import capture_audio, transcribe_audio
from momobot.observation.camera import capture_camera
from momobot.observation.screen import capture_screen
from momobot.observation.system import get_system_metrics
from momobot.observation.window import get_active_window
from momobot.schemas.observation import ObservationBundle


def observe(
    goal: str = "",
    monitor_index: int = 1,
    run_ocr: bool = True,
    enable_camera: bool = False,
    enable_audio: bool = False,
    audio_duration: float = 3.0,
    openai_api_key: Optional[str] = None,
) -> ObservationBundle:
    """Collect a full multimodal ObservationBundle for one agent tick.

    Args:
        goal: The current agent goal (embedded in the bundle for context).
        monitor_index: Which monitor to capture (1 = primary).
        run_ocr: Whether to run Tesseract OCR on the screen capture.
        enable_camera: Whether to capture a camera frame.
        enable_audio: Whether to record and transcribe audio.
        audio_duration: How many seconds of audio to record.
        openai_api_key: Key for OpenAI Whisper API transcription (optional).

    Returns:
        A fully populated ObservationBundle.
    """
    tick_id = str(uuid.uuid4())

    screen = capture_screen(monitor_index=monitor_index, run_ocr=run_ocr)
    window = get_active_window()
    system = get_system_metrics()

    camera = capture_camera() if enable_camera else None

    audio = None
    if enable_audio:
        raw_clip = capture_audio(duration_seconds=audio_duration)
        if raw_clip is not None:
            transcript = transcribe_audio(raw_clip, openai_api_key=openai_api_key)
            raw_clip.transcript = transcript
            audio = raw_clip

    return ObservationBundle(
        screen=screen,
        window=window,
        system=system,
        camera=camera,
        audio=audio,
        tick_id=tick_id,
        goal=goal,
    )
