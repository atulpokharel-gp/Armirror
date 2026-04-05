"""Screen capture, OCR, and vision analysis."""

from __future__ import annotations

import io
import logging
from typing import Optional

logger = logging.getLogger(__name__)

try:
    import mss
    import mss.tools

    _MSS_AVAILABLE = True
except ImportError:  # pragma: no cover
    _MSS_AVAILABLE = False

try:
    from PIL import Image

    _PIL_AVAILABLE = True
except ImportError:  # pragma: no cover
    _PIL_AVAILABLE = False

try:
    import pytesseract

    _TESSERACT_AVAILABLE = True
except ImportError:  # pragma: no cover
    _TESSERACT_AVAILABLE = False

from momobot.schemas.observation import ScreenCapture


def capture_screen(monitor_index: int = 1, run_ocr: bool = True) -> ScreenCapture:
    """Capture the full screen (or a specific monitor) and return a ScreenCapture.

    Args:
        monitor_index: 1-based index of the monitor to capture (0 = all monitors).
        run_ocr: Whether to run Tesseract OCR on the captured image.

    Returns:
        A ScreenCapture with the image as base64-encoded PNG and optional OCR text.
    """
    if not _MSS_AVAILABLE:
        raise RuntimeError("mss is not installed. Run: pip install mss")
    if not _PIL_AVAILABLE:
        raise RuntimeError("Pillow is not installed. Run: pip install Pillow")

    with mss.mss() as sct:
        monitors = sct.monitors
        if monitor_index >= len(monitors):
            monitor_index = 1  # fall back to primary
        region = monitors[monitor_index]
        raw = sct.grab(region)
        width, height = raw.width, raw.height

        # Convert mss screenshot to PNG bytes via Pillow
        img = Image.frombytes("RGB", (width, height), raw.rgb)
        buf = io.BytesIO()
        img.save(buf, format="PNG", optimize=True)
        png_bytes = buf.getvalue()

    ocr_text = ""
    if run_ocr and _TESSERACT_AVAILABLE:
        try:
            buf.seek(0)
            pil_img = Image.open(buf)
            ocr_text = pytesseract.image_to_string(pil_img)
        except Exception as exc:  # noqa: BLE001
            logger.debug("OCR failed: %s", exc)

    return ScreenCapture.from_bytes(png_bytes, width=width, height=height, ocr_text=ocr_text)


def diff_screens(before: ScreenCapture, after: ScreenCapture) -> float:
    """Return a normalized pixel-difference score between two captures (0=identical, 1=fully different).

    Uses a fast mean-absolute-difference over downsampled thumbnails so that minor
    rendering artefacts don't inflate the score.
    """
    if not _PIL_AVAILABLE:
        return 0.0

    try:
        import numpy as np

        thumb_size = (160, 90)
        img_a = Image.open(io.BytesIO(before.to_bytes())).resize(thumb_size).convert("RGB")
        img_b = Image.open(io.BytesIO(after.to_bytes())).resize(thumb_size).convert("RGB")
        arr_a = np.asarray(img_a, dtype=np.float32)
        arr_b = np.asarray(img_b, dtype=np.float32)
        diff = float(np.mean(np.abs(arr_a - arr_b))) / 255.0
        return diff
    except Exception as exc:  # noqa: BLE001
        logger.debug("Screen diff failed: %s", exc)
        return 0.0
