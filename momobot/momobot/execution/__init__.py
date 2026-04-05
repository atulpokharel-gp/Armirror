"""Execution subpackage.

ActionExecutor is imported lazily to avoid pulling in pyautogui at import time
in headless environments (no DISPLAY set).
"""


def __getattr__(name: str):  # type: ignore[return]
    if name == "ActionExecutor":
        from momobot.execution.executor import ActionExecutor  # noqa: PLC0415

        return ActionExecutor
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
