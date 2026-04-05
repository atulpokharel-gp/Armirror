"""Pydantic-settings based configuration loader for MomoBot."""

from __future__ import annotations

from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class MomoBotSettings(BaseSettings):
    """Loads configuration from environment variables and .env files.

    All settings can be overridden via environment variables prefixed with
    ``MOMOBOT_`` (case-insensitive).
    """

    model_config = SettingsConfigDict(
        env_prefix="MOMOBOT_",
        env_file=(".env", ".env.local"),
        extra="ignore",
    )

    # API keys (no prefix — pulled from bare env vars)
    anthropic_api_key: str = Field(default="", alias="ANTHROPIC_API_KEY")
    openai_api_key: str = Field(default="", alias="OPENAI_API_KEY")

    # Storage
    db_path: str = "momobot.db"

    # LLM
    model: str = "claude-opus-4-5"

    # Observation
    monitor_index: int = 1
    ocr: bool = True
    camera: bool = False
    audio: bool = False
    audio_duration: float = 3.0

    # Policy
    allow_destructive: bool = False
    authorized_apps: str = ""  # comma-separated list

    # Timing
    tick_delay: float = 1.0
    max_ticks: int = 50

    # Logging
    log_level: str = "INFO"

    def get_authorized_apps(self) -> list[str]:
        return [a.strip() for a in self.authorized_apps.split(",") if a.strip()]

    model_config = SettingsConfigDict(
        populate_by_name=True,
        env_file=(".env", ".env.local"),
        extra="ignore",
    )
