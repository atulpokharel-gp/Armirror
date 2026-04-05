"""Optional microphone / audio capture and transcription."""

from __future__ import annotations

import base64
import io
import logging
import time
from typing import Optional

logger = logging.getLogger(__name__)

try:
    import sounddevice as sd
    import soundfile as sf

    _AUDIO_AVAILABLE = True
except (ImportError, OSError):  # OSError: PortAudio library not found
    _AUDIO_AVAILABLE = False

from momobot.schemas.observation import AudioClip


def capture_audio(
    duration_seconds: float = 3.0,
    sample_rate: int = 16000,
) -> Optional[AudioClip]:
    """Record *duration_seconds* of mono audio from the default microphone.

    Returns None if sounddevice / soundfile are not installed or no device is available.
    """
    if not _AUDIO_AVAILABLE:
        logger.debug("sounddevice/soundfile not available; skipping audio capture.")
        return None

    try:
        frames = sd.rec(
            int(duration_seconds * sample_rate),
            samplerate=sample_rate,
            channels=1,
            dtype="float32",
        )
        sd.wait()

        # Encode raw PCM as WAV bytes → base64
        buf = io.BytesIO()
        sf.write(buf, frames, sample_rate, format="WAV", subtype="FLOAT")
        audio_b64 = base64.b64encode(buf.getvalue()).decode()
        return AudioClip(
            duration_seconds=duration_seconds,
            sample_rate=sample_rate,
            audio_b64=audio_b64,
        )
    except Exception as exc:  # noqa: BLE001
        logger.warning("Audio capture failed: %s", exc)
        return None


def transcribe_audio(clip: AudioClip, openai_api_key: Optional[str] = None) -> str:
    """Transcribe an AudioClip using the OpenAI Whisper API (preferred) or local Whisper.

    Returns the transcription text or an empty string on failure.
    """
    if not clip.audio_b64:
        return ""

    raw_bytes = base64.b64decode(clip.audio_b64)

    # --- Try OpenAI Whisper API first ---
    if openai_api_key:
        try:
            from openai import OpenAI  # type: ignore

            client = OpenAI(api_key=openai_api_key)
            buf = io.BytesIO(raw_bytes)
            buf.name = "audio.wav"
            result = client.audio.transcriptions.create(model="whisper-1", file=buf)
            return result.text
        except Exception as exc:  # noqa: BLE001
            logger.debug("OpenAI Whisper API failed: %s. Trying local Whisper.", exc)

    # --- Fall back to local Whisper ---
    try:
        import tempfile

        import whisper  # type: ignore

        model = whisper.load_model("base")
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            tmp.write(raw_bytes)
            tmp_path = tmp.name
        result = model.transcribe(tmp_path)
        import os

        os.unlink(tmp_path)
        return result.get("text", "")
    except Exception as exc:  # noqa: BLE001
        logger.debug("Local Whisper transcription failed: %s", exc)

    return ""
