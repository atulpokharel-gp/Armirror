"""Centralized Cognition Mesh — single interface to all memory stores and live state."""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import Any, Optional

from momobot.cognition.memory.failure import FailureMemory
from momobot.cognition.memory.skill import SkillMemory
from momobot.cognition.memory.workflow import WorkflowMemory
from momobot.schemas.memory import (
    FailureRecord,
    SkillRecord,
    WorkflowRecord,
    WorkflowStep,
)
from momobot.schemas.observation import ObservationBundle

logger = logging.getLogger(__name__)


@dataclass
class CognitionMesh:
    """Unified context hub that connects observations, memory, and the decision engine.

    Attributes:
        db_path: Filesystem path to the SQLite database used by all memory stores.
        current_goal: The active high-level goal the agent is pursuing.
        current_workflow_id: ID of the workflow record for the current goal execution.
        last_observation: The most recent ObservationBundle from the observation layer.
        extra: Arbitrary metadata (e.g. authorised app list, policy flags).
    """

    db_path: str
    current_goal: str = ""
    current_workflow_id: Optional[str] = None
    last_observation: Optional[ObservationBundle] = None
    extra: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        self.workflow_memory = WorkflowMemory(self.db_path)
        self.skill_memory = SkillMemory(self.db_path)
        self.failure_memory = FailureMemory(self.db_path)

    # ------------------------------------------------------------------
    # Workflow helpers
    # ------------------------------------------------------------------

    async def begin_goal(self, goal: str, tags: list[str] | None = None) -> WorkflowRecord:
        """Start a new workflow for *goal* and update the mesh state."""
        self.current_goal = goal
        record = await self.workflow_memory.start_workflow(goal, tags=tags)
        self.current_workflow_id = record.workflow_id
        logger.info("Workflow started: %s — %s", record.workflow_id, goal)
        return record

    async def record_step(self, step: WorkflowStep) -> None:
        """Append a step to the active workflow."""
        if self.current_workflow_id:
            await self.workflow_memory.add_step(self.current_workflow_id, step)

    async def finish_goal(
        self, status: str = "completed", outcome_summary: str = ""
    ) -> None:
        """Mark the active workflow as completed/failed/aborted."""
        if self.current_workflow_id:
            await self.workflow_memory.complete_workflow(
                self.current_workflow_id,
                status=status,
                outcome_summary=outcome_summary,
            )
            logger.info("Workflow %s → %s", self.current_workflow_id, status)
            self.current_workflow_id = None

    # ------------------------------------------------------------------
    # Observation helpers
    # ------------------------------------------------------------------

    def update_observation(self, bundle: ObservationBundle) -> None:
        """Replace the live observation state on the mesh."""
        self.last_observation = bundle

    # ------------------------------------------------------------------
    # Memory retrieval helpers
    # ------------------------------------------------------------------

    async def retrieve_context(
        self, tags: list[str], skill_limit: int = 5, workflow_limit: int = 3
    ) -> dict[str, Any]:
        """Retrieve relevant skills and recent workflows for the given tags.

        Returns a dictionary ready to be serialised and sent to the LLM.
        """
        skills: list[SkillRecord] = await self.skill_memory.get_relevant(
            tags, limit=skill_limit
        )
        workflows: list[WorkflowRecord] = []
        for tag in tags[:2]:
            workflows.extend(await self.workflow_memory.search(tag, limit=workflow_limit))
        # De-duplicate
        seen_wf: set[str] = set()
        deduped_wf = []
        for wf in workflows:
            if wf.workflow_id not in seen_wf:
                seen_wf.add(wf.workflow_id)
                deduped_wf.append(wf)

        failures: list[FailureRecord] = await self.failure_memory.get_recent(limit=3)

        return {
            "skills": [
                {
                    "name": s.name,
                    "description": s.description,
                    "success_rate": s.success_rate,
                    "actions": s.action_sequence[:5],  # first 5 steps for brevity
                }
                for s in skills
            ],
            "recent_workflows": [
                {
                    "goal": w.goal,
                    "status": w.status,
                    "steps": len(w.steps),
                    "outcome": w.outcome_summary,
                }
                for w in deduped_wf[:workflow_limit]
            ],
            "recent_failures": [
                {
                    "action": f.action_type,
                    "error": f.error_message,
                    "correction": f.correction,
                }
                for f in failures
                if not f.resolved or f.correction
            ],
        }

    # ------------------------------------------------------------------
    # Lifecycle
    # ------------------------------------------------------------------

    async def close(self) -> None:
        """Close all underlying memory store connections."""
        await self.workflow_memory.close()
        await self.skill_memory.close()
        await self.failure_memory.close()
