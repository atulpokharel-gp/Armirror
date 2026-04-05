"""LLM-powered decision engine — selects the next best action given structured context."""

from __future__ import annotations

import json
import logging
import uuid
from typing import Any, Optional

from momobot.schemas.action import ActionParameters, ActionType, PlannedAction
from momobot.schemas.memory import DecisionRecord
from momobot.schemas.observation import ObservationBundle

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# System prompt template
# ---------------------------------------------------------------------------
_SYSTEM_PROMPT = """\
You are MomoBot, a local AI agent that controls a computer to accomplish goals \
on behalf of the user. You observe the screen, remember past actions, and pick \
the single best next action.

## Authorised action types
{action_types}

## Rules
- NEVER interact with password fields or any element labelled "password".
- NEVER perform destructive actions (file deletion, form submit with personal data) \
  unless `allow_destructive` is explicitly true in the context.
- If you are uncertain, emit action_type="ask_human" with a clear message.
- If the goal is achieved, emit action_type="goal_complete".
- If the goal is impossible, emit action_type="goal_abort" with reasoning.
- Keep reasoning concise (≤3 sentences).

## Output format (strict JSON, no markdown fences)
{{
  "action_type": "<one of the authorised types>",
  "parameters": {{ <action-specific parameters> }},
  "reasoning": "<why this action>",
  "confidence": <0.0-1.0>,
  "requires_confirmation": <true|false>,
  "is_destructive": <true|false>
}}
"""

_ACTION_TYPES_LIST = "\n".join(f"- {a.value}" for a in ActionType)


def _build_user_message(
    goal: str,
    observation: ObservationBundle,
    memory_context: dict[str, Any],
    allow_destructive: bool,
    authorized_apps: list[str],
) -> list[dict[str, Any]]:
    """Compose the user-role message(s) for the LLM, including the screen image."""
    context_text = json.dumps(
        {
            "goal": goal,
            "active_window": {
                "title": observation.window.title,
                "app": observation.window.app_name,
            },
            "system": {
                "cpu": observation.system.cpu_percent,
                "memory": observation.system.memory_percent,
            },
            "screen_text_excerpt": observation.screen.ocr_text[:1500],
            "vision_summary": observation.vision_summary,
            "audio_transcript": observation.audio.transcript if observation.audio else "",
            "memory": memory_context,
            "policy": {
                "allow_destructive": allow_destructive,
                "authorized_apps": authorized_apps,
            },
        },
        indent=2,
    )

    messages: list[dict[str, Any]] = [
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": (
                        "Here is your current environment context. "
                        "Decide on the single best next action.\n\n"
                        f"```json\n{context_text}\n```"
                    ),
                },
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": "image/png",
                        "data": observation.screen.image_b64,
                    },
                },
            ],
        }
    ]
    return messages


def _parse_llm_response(raw: str) -> PlannedAction:
    """Parse the LLM's JSON output into a PlannedAction, with safe fallback."""
    raw = raw.strip()
    # Strip accidental markdown code fences
    if raw.startswith("```"):
        lines = raw.split("\n")
        raw = "\n".join(lines[1:-1]) if len(lines) > 2 else raw

    try:
        data = json.loads(raw)
        action_type = ActionType(data.get("action_type", "ask_human"))
        params_data = data.get("parameters", {})
        # Sanitise: never log or pass through text for password fields
        if params_data.get("field_type") == "password":
            params_data["text"] = "***MASKED***"
        parameters = ActionParameters(**{k: v for k, v in params_data.items() if k in ActionParameters.model_fields})
        return PlannedAction(
            action_type=action_type,
            parameters=parameters,
            reasoning=str(data.get("reasoning", "")),
            confidence=float(data.get("confidence", 0.8)),
            requires_confirmation=bool(data.get("requires_confirmation", False)),
            is_destructive=bool(data.get("is_destructive", False)),
        )
    except Exception as exc:  # noqa: BLE001
        logger.warning("Failed to parse LLM response (%s): %r", exc, raw[:200])
        return PlannedAction(
            action_type=ActionType.ASK_HUMAN,
            parameters=ActionParameters(
                message="I could not parse my own decision. Please advise."
            ),
            reasoning=f"Parse error: {exc}",
            confidence=0.0,
        )


class DecisionEngine:
    """Uses Claude (Anthropic) to select the next action.

    Falls back to a safe ``ask_human`` action if the API call fails.
    """

    def __init__(
        self,
        anthropic_api_key: str,
        model: str = "claude-opus-4-5",
        allow_destructive: bool = False,
        authorized_apps: list[str] | None = None,
        db_path: str = "momobot.db",
    ) -> None:
        self._api_key = anthropic_api_key
        self._model = model
        self._allow_destructive = allow_destructive
        self._authorized_apps = authorized_apps or []
        self._db_path = db_path
        self._decision_store: list[DecisionRecord] = []  # in-memory audit log

        try:
            import anthropic  # type: ignore

            self._client = anthropic.Anthropic(api_key=anthropic_api_key)
        except ImportError as exc:
            raise RuntimeError("anthropic package is required. Run: pip install anthropic") from exc

    async def decide(
        self,
        goal: str,
        observation: ObservationBundle,
        memory_context: dict[str, Any],
    ) -> PlannedAction:
        """Select the next action for *goal* given *observation* and *memory_context*.

        Returns a PlannedAction (never raises — falls back to ask_human on error).
        """
        system = _SYSTEM_PROMPT.format(action_types=_ACTION_TYPES_LIST)
        messages = _build_user_message(
            goal=goal,
            observation=observation,
            memory_context=memory_context,
            allow_destructive=self._allow_destructive,
            authorized_apps=self._authorized_apps,
        )

        raw_response = ""
        try:
            response = self._client.messages.create(
                model=self._model,
                max_tokens=512,
                system=system,
                messages=messages,  # type: ignore[arg-type]
            )
            raw_response = response.content[0].text  # type: ignore[index]
        except Exception as exc:  # noqa: BLE001
            logger.error("LLM decision call failed: %s", exc)
            return PlannedAction(
                action_type=ActionType.ASK_HUMAN,
                parameters=ActionParameters(message=f"LLM error: {exc}"),
                reasoning="API call failed",
                confidence=0.0,
            )

        action = _parse_llm_response(raw_response)

        # Audit log
        record = DecisionRecord(
            decision_id=str(uuid.uuid4()),
            tick_id=observation.tick_id,
            goal=goal,
            screen_summary=observation.vision_summary or observation.screen.ocr_text[:200],
            action_type=action.action_type.value,
            action_params=action.parameters.model_dump(exclude_none=True),
            reasoning=action.reasoning,
            confidence=action.confidence,
        )
        self._decision_store.append(record)
        if len(self._decision_store) > 1000:
            self._decision_store = self._decision_store[-500:]

        logger.info(
            "Decision [%s]: %s (confidence=%.2f) — %s",
            observation.tick_id,
            action.action_type.value,
            action.confidence,
            action.reasoning,
        )
        return action

    async def summarise_screen(self, observation: ObservationBundle) -> str:
        """Ask the LLM to produce a concise natural-language description of the screen.

        Used to populate ``ObservationBundle.vision_summary``.
        """
        try:
            response = self._client.messages.create(
                model=self._model,
                max_tokens=256,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": (
                                    "Describe what you see on this screen in 2-3 sentences. "
                                    "Focus on: active application, visible UI elements, "
                                    "any forms or dialogs, and the apparent state of the task."
                                ),
                            },
                            {
                                "type": "image",
                                "source": {
                                    "type": "base64",
                                    "media_type": "image/png",
                                    "data": observation.screen.image_b64,
                                },
                            },
                        ],
                    }
                ],
            )
            return response.content[0].text.strip()  # type: ignore[index]
        except Exception as exc:  # noqa: BLE001
            logger.debug("Vision summary failed: %s", exc)
            return observation.screen.ocr_text[:300]
