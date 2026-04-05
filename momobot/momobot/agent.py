"""MomoAgent — the main agent loop orchestrating the full perception–action cycle.

Loop per tick:
  1. Observe   — capture screen, window, system, optional camera/audio
  2. Structure — LLM vision summary of the screen
  3. Retrieve  — fetch relevant skills/workflows/failures from memory
  4. Decide    — LLM selects the next action
  5. Execute   — perform the action
  6. Verify    — compare pre/post screen state
  7. Learn     — write tick to memory
  8. Update    — refresh cognition mesh
"""

from __future__ import annotations

import asyncio
import logging
import time
from dataclasses import dataclass, field
from typing import Any, Optional

from momobot.cognition.decision import DecisionEngine
from momobot.cognition.mesh import CognitionMesh
from momobot.execution.executor import ActionExecutor
from momobot.learning.learner import LearningSystem
from momobot.observation import observe
from momobot.schemas.action import ActionResult, ActionType
from momobot.schemas.observation import ObservationBundle
from momobot.verification.verifier import ActionVerifier

logger = logging.getLogger(__name__)


@dataclass
class AgentConfig:
    """Runtime configuration for MomoAgent."""

    # Paths / keys
    db_path: str = "momobot.db"
    anthropic_api_key: str = ""
    openai_api_key: str = ""

    # LLM model
    model: str = "claude-opus-4-5"

    # Observation settings
    monitor_index: int = 1
    run_ocr: bool = True
    enable_camera: bool = False
    enable_audio: bool = False
    audio_duration: float = 3.0

    # Policy
    allow_destructive: bool = False
    authorized_apps: list[str] = field(default_factory=list)
    require_confirmation_on_low_confidence: bool = True
    low_confidence_threshold: float = 0.6

    # Timing
    tick_delay_seconds: float = 1.0
    max_ticks_per_goal: int = 50

    # Tags used for memory retrieval
    default_tags: list[str] = field(default_factory=list)


class MomoAgent:
    """Living multimodal local agent.

    Usage::

        agent = MomoAgent(config)
        await agent.run_goal("Open the browser and search for today's news")
    """

    def __init__(self, config: AgentConfig) -> None:
        self._config = config
        self._mesh = CognitionMesh(db_path=config.db_path)
        self._decision_engine = DecisionEngine(
            anthropic_api_key=config.anthropic_api_key,
            model=config.model,
            allow_destructive=config.allow_destructive,
            authorized_apps=config.authorized_apps,
            db_path=config.db_path,
        )
        self._executor = ActionExecutor(allow_destructive=config.allow_destructive)
        self._verifier = ActionVerifier()
        self._learner = LearningSystem(self._mesh)

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    async def run_goal(self, goal: str, tags: list[str] | None = None) -> str:
        """Run the agent loop for a single *goal*.

        Returns a short outcome description ("completed", "failed", "aborted",
        or "max_ticks_reached").
        """
        cfg = self._config
        effective_tags = list(set((tags or []) + cfg.default_tags))

        workflow = await self._mesh.begin_goal(goal, tags=effective_tags)
        workflow_id = workflow.workflow_id
        outcome = "max_ticks_reached"

        logger.info("▶ Goal: %s (workflow_id=%s)", goal, workflow_id)

        for tick in range(cfg.max_ticks_per_goal):
            logger.info("── Tick %d/%d ──", tick + 1, cfg.max_ticks_per_goal)
            outcome = await self._tick(goal, effective_tags)
            if outcome in ("completed", "aborted", "failed"):
                break
            await asyncio.sleep(cfg.tick_delay_seconds)

        # Finalise the workflow record
        await self._mesh.finish_goal(status=outcome, outcome_summary=f"Ticks: {tick + 1}")
        # Attempt skill extraction
        await self._learner.on_workflow_complete(
            workflow_id=workflow_id,
            status=outcome,
            outcome_summary=f"Goal: {goal}",
        )
        logger.info("◀ Goal finished: %s → %s", goal, outcome)
        return outcome

    async def run_interactive(self) -> None:
        """Prompt the user for goals and run them one by one until 'exit' is typed."""
        print("MomoBot interactive mode. Type a goal and press Enter. Type 'exit' to quit.")
        while True:
            goal = input("\n🤖 Goal> ").strip()
            if goal.lower() in ("exit", "quit", "q"):
                print("Goodbye!")
                break
            if not goal:
                continue
            outcome = await self.run_goal(goal)
            print(f"\n✅ Outcome: {outcome}")

    async def close(self) -> None:
        """Release all resources."""
        await self._mesh.close()

    # ------------------------------------------------------------------
    # Internal tick logic
    # ------------------------------------------------------------------

    async def _tick(self, goal: str, tags: list[str]) -> str:
        """Execute one full observe–decide–execute–verify–learn cycle.

        Returns a status string: "ok" | "completed" | "aborted" | "failed"
        """
        cfg = self._config

        # 1. Observe
        bundle: ObservationBundle = observe(
            goal=goal,
            monitor_index=cfg.monitor_index,
            run_ocr=cfg.run_ocr,
            enable_camera=cfg.enable_camera,
            enable_audio=cfg.enable_audio,
            audio_duration=cfg.audio_duration,
            openai_api_key=cfg.openai_api_key or None,
        )
        before_screen = bundle.screen
        self._mesh.update_observation(bundle)

        # 2. Structure — vision summary
        vision_summary = await self._decision_engine.summarise_screen(bundle)
        bundle.vision_summary = vision_summary
        logger.debug("Vision summary: %s", vision_summary[:120])

        # 3. Retrieve memory context
        memory_ctx = await self._mesh.retrieve_context(tags=tags)

        # 4. Decide
        action = await self._decision_engine.decide(
            goal=goal,
            observation=bundle,
            memory_context=memory_ctx,
        )

        # Handle confirmation requirement
        if (
            cfg.require_confirmation_on_low_confidence
            and action.confidence < cfg.low_confidence_threshold
            and action.action_type
            not in (ActionType.GOAL_COMPLETE, ActionType.GOAL_ABORT, ActionType.ASK_HUMAN)
        ):
            action.requires_confirmation = True

        if action.requires_confirmation:
            confirmed = await self._ask_confirmation(action)
            if not confirmed:
                logger.info("Action cancelled by user.")
                return "ok"

        # Meta-action early exits
        if action.action_type == ActionType.GOAL_COMPLETE:
            logger.info("Goal declared complete: %s", action.reasoning)
            return "completed"
        if action.action_type == ActionType.GOAL_ABORT:
            logger.warning("Goal aborted: %s", action.reasoning)
            return "aborted"
        if action.action_type == ActionType.ASK_HUMAN:
            msg = action.parameters.message or action.reasoning
            logger.info("Agent asks: %s", msg)
            print(f"\n🤖 MomoBot asks: {msg}")
            answer = input("Your answer: ").strip()
            # The answer feeds into the next tick via the audio transcript slot
            bundle.audio = bundle.audio or __import__(
                "momobot.schemas.observation", fromlist=["AudioClip"]
            ).AudioClip(duration_seconds=0)
            bundle.audio.transcript = answer
            return "ok"

        # 5. Execute
        result: ActionResult = self._executor.execute(action)

        # Capture post-action screen
        after_bundle: ObservationBundle = observe(
            goal=goal,
            monitor_index=cfg.monitor_index,
            run_ocr=False,  # Skip OCR on post-action for speed
            enable_camera=False,
            enable_audio=False,
        )
        after_screen = after_bundle.screen

        # 6. Verify
        vision_after = await self._decision_engine.summarise_screen(after_bundle)
        result = self._verifier.verify(result, before_screen, after_screen, vision_after)

        # 7. Learn
        await self._learner.record_tick(
            tick_id=bundle.tick_id,
            goal=goal,
            screen_summary=vision_summary,
            window_title=bundle.window.title,
            result=result,
        )

        # 8. Update mesh
        self._mesh.update_observation(after_bundle)

        status = "ok"
        if not result.success:
            logger.warning(
                "Action %s failed: %s", action.action_type.value, result.error_message
            )
            status = "failed" if action.action_type == ActionType.GOAL_ABORT else "ok"

        return status

    @staticmethod
    async def _ask_confirmation(action) -> bool:  # type: ignore[override]
        """Ask the user to confirm a low-confidence or destructive action."""
        print(
            f"\n⚠️  MomoBot wants to perform: {action.action_type.value}\n"
            f"   Reasoning: {action.reasoning}\n"
            f"   Confidence: {action.confidence:.0%}\n"
            f"   Destructive: {action.is_destructive}"
        )
        reply = input("Confirm? [y/N]: ").strip().lower()
        return reply in ("y", "yes")
