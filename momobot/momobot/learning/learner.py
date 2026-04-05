"""Learning system — extracts skills and updates memory from completed workflows."""

from __future__ import annotations

import logging
from typing import Optional

from momobot.cognition.mesh import CognitionMesh
from momobot.schemas.action import ActionResult, ActionType
from momobot.schemas.memory import WorkflowRecord, WorkflowStep

logger = logging.getLogger(__name__)

# Minimum steps in a completed workflow before we attempt skill extraction
_MIN_STEPS_FOR_SKILL = 3
# Minimum success rate required to extract a skill
_SKILL_SUCCESS_THRESHOLD = 0.8


class LearningSystem:
    """Analyses workflow outcomes and distils reusable skills.

    Responsibilities:
    - After each tick, record a WorkflowStep on the active workflow.
    - After a workflow completes successfully, evaluate whether its action
      sequence qualifies as a new reusable skill.
    - After a failure, persist a FailureRecord and attach corrections when
      provided.
    """

    def __init__(self, mesh: CognitionMesh) -> None:
        self._mesh = mesh

    async def record_tick(
        self,
        tick_id: str,
        goal: str,
        screen_summary: str,
        window_title: str,
        result: ActionResult,
    ) -> None:
        """Persist a single agent tick as a WorkflowStep."""
        step = WorkflowStep(
            tick_id=tick_id,
            goal=goal,
            screen_summary=screen_summary,
            window_title=window_title,
            action_type=result.action.action_type.value,
            action_params=result.action.parameters.model_dump(exclude_none=True),
            reasoning=result.action.reasoning,
            success=result.success,
            verified=result.verified,
        )
        await self._mesh.record_step(step)

        if not result.success:
            await self._mesh.failure_memory.record_failure(
                goal=goal,
                screen_summary=screen_summary,
                window_title=window_title,
                action_type=result.action.action_type.value,
                action_params=result.action.parameters.model_dump(exclude_none=True),
                error_message=result.error_message,
                tags=[result.action.action_type.value, "auto"],
            )

    async def on_workflow_complete(
        self,
        workflow_id: str,
        status: str,
        outcome_summary: str,
    ) -> Optional[str]:
        """Called when a workflow finishes. Returns the new skill_id if one was created.

        Skill extraction criteria:
        - Workflow status is "completed".
        - At least _MIN_STEPS_FOR_SKILL steps.
        - All steps succeeded and were verified.
        """
        record = await self._mesh.workflow_memory.get(workflow_id)
        if record is None or status != "completed":
            return None

        steps = record.steps
        if len(steps) < _MIN_STEPS_FOR_SKILL:
            return None

        success_rate = sum(1 for s in steps if s.success and s.verified) / len(steps)
        if success_rate < _SKILL_SUCCESS_THRESHOLD:
            return None

        action_sequence = [
            {
                "action_type": s.action_type,
                "parameters": s.action_params,
            }
            for s in steps
        ]

        # Derive tags from action types present in the workflow
        tags = list({s.action_type for s in steps})
        tags.append("auto-extracted")

        skill = await self._mesh.skill_memory.save_skill(
            name=f"Skill: {record.goal[:60]}",
            description=(
                f"Auto-extracted from workflow {workflow_id}. "
                f"Goal: {record.goal}. "
                f"Outcome: {outcome_summary[:100]}"
            ),
            action_sequence=action_sequence,
            trigger_patterns=[record.goal],
            tags=tags,
        )
        logger.info(
            "Skill extracted from workflow %s → skill_id=%s", workflow_id, skill.skill_id
        )
        return skill.skill_id

    async def apply_correction(self, failure_id: str, correction: str) -> None:
        """Attach a human-provided correction to a failure record."""
        await self._mesh.failure_memory.add_correction(failure_id, correction)
        logger.info("Correction applied to failure %s", failure_id)
