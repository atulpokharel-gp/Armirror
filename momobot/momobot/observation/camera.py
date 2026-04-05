"""Optional camera frame capture."""

from __future__ import annotations

import io
import logging
from typing import Optional

logger = logging.getLogger(__name__)

try:
    import cv2
    import numpy as np

    _CV2_AVAILABLE = True
except ImportError:  # pragma: no cover
    _CV2_AVAILABLE = False

try:
    from PIL import Image

    _PIL_AVAILABLE = True
except ImportError:  # pragma: no cover
    _PIL_AVAILABLE = False

from momobot.schemas.observation import CameraFrame


def capture_camera(camera_index: int = 0) -> Optional[CameraFrame]:
    """Capture a single frame from the specified camera device.

    Returns None if no camera is available or if OpenCV is not installed.
    """
    if not _CV2_AVAILABLE or not _PIL_AVAILABLE:
        logger.debug("OpenCV or Pillow not available; skipping camera capture.")
        return None

    cap = cv2.VideoCapture(camera_index)
    if not cap.isOpened():
        logger.debug("Camera %d not available.", camera_index)
        return None

    try:
        ret, frame = cap.read()
        if not ret or frame is None:
            logger.debug("Camera %d returned no frame.", camera_index)
            return None

        # Convert BGR (OpenCV default) → RGB → PNG bytes
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        height, width = rgb.shape[:2]
        pil_img = Image.fromarray(rgb)
        buf = io.BytesIO()
        pil_img.save(buf, format="PNG", optimize=True)
        png_bytes = buf.getvalue()
        return CameraFrame.from_bytes(png_bytes, width=width, height=height)
    finally:
        cap.release()
