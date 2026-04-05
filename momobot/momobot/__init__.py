"""MomoBot — multimodal local agent."""

__version__ = "0.1.0"


def __getattr__(name: str):  # type: ignore[return]
    if name == "MomoAgent":
        from momobot.agent import MomoAgent  # noqa: PLC0415

        return MomoAgent
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
