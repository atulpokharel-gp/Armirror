"""MomoBot CLI — Typer-based command-line interface."""

from __future__ import annotations

import asyncio
import logging
import os
import sys
from typing import Optional

import typer
from rich.console import Console
from rich.table import Table

app = typer.Typer(
    name="momobot",
    help="MomoBot — multimodal local agent",
    add_completion=False,
)
console = Console()

# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------


def _get_config() -> "AgentConfig":  # type: ignore[name-defined]
    from momobot.agent import AgentConfig

    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key:
        console.print("[red]Error: ANTHROPIC_API_KEY environment variable not set.[/red]")
        raise typer.Exit(1)

    return AgentConfig(
        db_path=os.environ.get("MOMOBOT_DB_PATH", "momobot.db"),
        anthropic_api_key=api_key,
        openai_api_key=os.environ.get("OPENAI_API_KEY", ""),
        model=os.environ.get("MOMOBOT_MODEL", "claude-opus-4-5"),
        allow_destructive=os.environ.get("MOMOBOT_ALLOW_DESTRUCTIVE", "").lower() == "true",
        authorized_apps=[
            a.strip()
            for a in os.environ.get("MOMOBOT_AUTHORIZED_APPS", "").split(",")
            if a.strip()
        ],
        run_ocr=os.environ.get("MOMOBOT_OCR", "true").lower() != "false",
        enable_camera=os.environ.get("MOMOBOT_CAMERA", "false").lower() == "true",
        enable_audio=os.environ.get("MOMOBOT_AUDIO", "false").lower() == "true",
    )


def _setup_logging(verbose: bool) -> None:
    level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(
        level=level,
        format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
        datefmt="%H:%M:%S",
    )


# ---------------------------------------------------------------------------
# Commands
# ---------------------------------------------------------------------------


@app.command()
def run(
    goal: Optional[str] = typer.Argument(None, help="Goal for the agent to accomplish."),
    interactive: bool = typer.Option(False, "--interactive", "-i", help="Interactive mode."),
    verbose: bool = typer.Option(False, "--verbose", "-v", help="Enable debug logging."),
    allow_destructive: bool = typer.Option(
        False, "--allow-destructive", help="Allow destructive actions (e.g. form submits)."
    ),
    camera: bool = typer.Option(False, "--camera", help="Enable camera input."),
    audio: bool = typer.Option(False, "--audio", help="Enable microphone input."),
) -> None:
    """Run MomoBot with a goal or in interactive mode."""
    _setup_logging(verbose)
    from momobot.agent import MomoAgent

    config = _get_config()
    config.allow_destructive = allow_destructive or config.allow_destructive
    config.enable_camera = camera or config.enable_camera
    config.enable_audio = audio or config.enable_audio

    agent = MomoAgent(config)

    async def _main() -> None:
        try:
            if interactive:
                await agent.run_interactive()
            elif goal:
                outcome = await agent.run_goal(goal)
                console.print(f"\n[bold green]Outcome:[/bold green] {outcome}")
            else:
                console.print("[yellow]Provide a goal argument or use --interactive.[/yellow]")
        finally:
            await agent.close()

    asyncio.run(_main())


@app.command()
def status(
    verbose: bool = typer.Option(False, "--verbose", "-v"),
) -> None:
    """Show the current cognition mesh state (recent workflows, skills, failures)."""
    _setup_logging(verbose)

    async def _main() -> None:
        from momobot.cognition.mesh import CognitionMesh

        config = _get_config()
        mesh = CognitionMesh(db_path=config.db_path)
        try:
            workflows = await mesh.workflow_memory.get_recent(limit=5)
            skills = await mesh.skill_memory.list_all(limit=10)
            failures = await mesh.failure_memory.get_recent(limit=5)
        finally:
            await mesh.close()

        # Workflows table
        wf_table = Table(title="Recent Workflows")
        wf_table.add_column("ID", style="dim", max_width=12)
        wf_table.add_column("Goal")
        wf_table.add_column("Status")
        wf_table.add_column("Steps")
        for w in workflows:
            wf_table.add_row(w.workflow_id[:8], w.goal[:60], w.status, str(len(w.steps)))
        console.print(wf_table)

        # Skills table
        sk_table = Table(title="Stored Skills")
        sk_table.add_column("ID", style="dim", max_width=12)
        sk_table.add_column("Name")
        sk_table.add_column("Success Rate")
        sk_table.add_column("Uses")
        for s in skills:
            sk_table.add_row(
                s.skill_id[:8], s.name[:50], f"{s.success_rate:.0%}", str(s.use_count)
            )
        console.print(sk_table)

        # Failures table
        fl_table = Table(title="Recent Failures")
        fl_table.add_column("ID", style="dim", max_width=12)
        fl_table.add_column("Action")
        fl_table.add_column("Error")
        fl_table.add_column("Resolved")
        for f in failures:
            fl_table.add_row(
                f.failure_id[:8],
                f.action_type,
                f.error_message[:50],
                "✅" if f.resolved else "❌",
            )
        console.print(fl_table)

    asyncio.run(_main())


@app.command()
def skills(
    action: str = typer.Argument("list", help="Action: list | delete"),
    skill_id: Optional[str] = typer.Argument(None, help="Skill ID for delete."),
) -> None:
    """Manage stored skills."""
    _setup_logging(False)

    async def _main() -> None:
        from momobot.cognition.memory import SkillMemory

        config = _get_config()
        mem = SkillMemory(db_path=config.db_path)
        try:
            if action == "list":
                all_skills = await mem.list_all(limit=50)
                table = Table(title="All Skills")
                table.add_column("ID", style="dim")
                table.add_column("Name")
                table.add_column("Success Rate")
                table.add_column("Uses")
                table.add_column("Tags")
                for s in all_skills:
                    table.add_row(
                        s.skill_id[:12],
                        s.name[:50],
                        f"{s.success_rate:.0%}",
                        str(s.use_count),
                        ", ".join(s.tags[:3]),
                    )
                console.print(table)
            elif action == "delete":
                if not skill_id:
                    console.print("[red]Provide a skill_id to delete.[/red]")
                    raise typer.Exit(1)
                await mem.delete(skill_id)
                console.print(f"[green]Skill {skill_id} deleted.[/green]")
            else:
                console.print(f"[red]Unknown action: {action}[/red]")
        finally:
            await mem.close()

    asyncio.run(_main())


@app.command()
def workflows(
    action: str = typer.Argument("list", help="Action: list | replay"),
    workflow_id: Optional[str] = typer.Argument(None, help="Workflow ID for replay."),
    verbose: bool = typer.Option(False, "--verbose", "-v"),
) -> None:
    """List or replay stored workflows."""
    _setup_logging(verbose)

    async def _main() -> None:
        from momobot.cognition.memory import WorkflowMemory

        config = _get_config()
        mem = WorkflowMemory(db_path=config.db_path)
        try:
            if action == "list":
                wfs = await mem.get_recent(limit=20)
                table = Table(title="Recent Workflows")
                table.add_column("ID", style="dim")
                table.add_column("Goal")
                table.add_column("Status")
                table.add_column("Steps")
                table.add_column("Outcome")
                for w in wfs:
                    table.add_row(
                        w.workflow_id[:12],
                        w.goal[:50],
                        w.status,
                        str(len(w.steps)),
                        w.outcome_summary[:40],
                    )
                console.print(table)

            elif action == "replay":
                if not workflow_id:
                    console.print("[red]Provide a workflow_id to replay.[/red]")
                    raise typer.Exit(1)
                record = await mem.get(workflow_id)
                if record is None:
                    console.print(f"[red]Workflow {workflow_id} not found.[/red]")
                    raise typer.Exit(1)

                console.print(
                    f"[bold]Replaying workflow:[/bold] {record.goal}\n"
                    f"Steps: {len(record.steps)}"
                )
                from momobot.agent import MomoAgent
                from momobot.execution.executor import ActionExecutor
                from momobot.schemas.action import ActionParameters, ActionType, PlannedAction

                cfg = config
                executor = ActionExecutor(allow_destructive=cfg.allow_destructive)
                for i, step in enumerate(record.steps):
                    console.print(f"  Step {i+1}: {step.action_type} — {step.reasoning[:60]}")
                    try:
                        action_type = ActionType(step.action_type)
                        params = ActionParameters(
                            **{
                                k: v
                                for k, v in step.action_params.items()
                                if k in ActionParameters.model_fields
                            }
                        )
                        planned = PlannedAction(action_type=action_type, parameters=params)
                        result = executor.execute(planned)
                        status = "✅" if result.success else f"❌ {result.error_message}"
                        console.print(f"           {status}")
                    except Exception as exc:  # noqa: BLE001
                        console.print(f"           [red]Error: {exc}[/red]")
                    import time

                    time.sleep(0.5)
            else:
                console.print(f"[red]Unknown action: {action}[/red]")
        finally:
            await mem.close()

    asyncio.run(_main())


if __name__ == "__main__":
    app()
