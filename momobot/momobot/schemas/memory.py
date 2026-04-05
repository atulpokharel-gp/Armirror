"""Pydantic schemas for MomoBot memory records."""

from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, Field


class MemoryKind(str, Enum):
    WORKFLOW = "workflow"
    SKILL = "skill"
    FAILURE = "failure"


class WorkflowStep(BaseModel):
    """One step inside a recorded workflow trace."""

    tick_id: str
    goal: str
    screen_summary: str
    window_title: str
    action_type: str
    action_params: dict[str, Any]
    reasoning: str
    success: bool
    verified: bool
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class WorkflowRecord(BaseModel):
    """A completed or in-progress multi-step workflow trace."""

    workflow_id: str
    goal: str
    status: str = "in_progress"  # in_progress | completed | failed | aborted
    steps: list[WorkflowStep] = Field(default_factory=list)
    outcome_summary: str = ""
    started_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    ended_at: Optional[datetime] = None
    tags: list[str] = Field(default_factory=list)
    use_count: int = 0


class SkillRecord(BaseModel):
    """A reusable skill extracted from successful workflow patterns."""

    skill_id: str
    name: str
    description: str
    trigger_patterns: list[str] = Field(default_factory=list)
    # Ordered list of action dicts ready to replay
    action_sequence: list[dict[str, Any]] = Field(default_factory=list)
    success_rate: float = 1.0
    use_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    tags: list[str] = Field(default_factory=list)


class FailureRecord(BaseModel):
    """A recorded failure, its context, and any applied correction."""

    failure_id: str
    goal: str
    screen_summary: str
    window_title: str
    action_type: str
    action_params: dict[str, Any]
    error_message: str
    correction: Optional[str] = None
    resolved: bool = False
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    tags: list[str] = Field(default_factory=list)


class DecisionRecord(BaseModel):
    """An entry in the decision log for auditability."""

    decision_id: str
    tick_id: str
    goal: str
    screen_summary: str
    retrieved_skills: list[str] = Field(default_factory=list)
    retrieved_workflows: list[str] = Field(default_factory=list)
    action_type: str
    action_params: dict[str, Any]
    reasoning: str
    confidence: float
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
