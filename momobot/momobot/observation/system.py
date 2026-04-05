"""System performance metrics via psutil."""

from __future__ import annotations

import logging

logger = logging.getLogger(__name__)

try:
    import psutil

    _PSUTIL_AVAILABLE = True
except ImportError:  # pragma: no cover
    _PSUTIL_AVAILABLE = False

from momobot.schemas.observation import SystemMetrics


def get_system_metrics() -> SystemMetrics:
    """Collect a snapshot of OS-level performance metrics.

    Returns zeroed metrics if psutil is not installed.
    """
    if not _PSUTIL_AVAILABLE:
        logger.debug("psutil not available; returning empty system metrics.")
        return SystemMetrics(
            cpu_percent=0.0,
            memory_percent=0.0,
            disk_percent=0.0,
            active_processes=0,
        )

    try:
        cpu = psutil.cpu_percent(interval=0.1)
        mem = psutil.virtual_memory().percent
        disk = psutil.disk_usage("/").percent
        procs = len(psutil.pids())
        return SystemMetrics(
            cpu_percent=cpu,
            memory_percent=mem,
            disk_percent=disk,
            active_processes=procs,
        )
    except Exception as exc:  # noqa: BLE001
        logger.warning("System metrics collection failed: %s", exc)
        return SystemMetrics(
            cpu_percent=0.0,
            memory_percent=0.0,
            disk_percent=0.0,
            active_processes=0,
        )
