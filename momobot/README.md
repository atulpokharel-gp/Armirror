# MomoBot — Multimodal Local Agent

MomoBot is a **living, self-improving multimodal local agent** built on top of the Armirror platform. It continuously observes the computing environment, reasons over goals and memory, executes actions through mouse/keyboard control, verifies outcomes, and learns from every interaction.

## Architecture

```
observe → structure → retrieve memory → decide → execute → verify → learn → update cognition
```

### Components

| Layer | Module | Description |
|-------|--------|-------------|
| Observation | `momobot.observation` | Screen capture, camera, audio, window state, system metrics |
| Schemas | `momobot.schemas` | Pydantic models for observations, actions, memory |
| Cognition Mesh | `momobot.cognition.mesh` | Centralized state store connecting all memory systems |
| Memory | `momobot.cognition.memory` | Workflow, skill, and failure memory stores |
| Decision Engine | `momobot.cognition.decision` | LLM-based action planning and goal tracking |
| Execution | `momobot.execution` | Mouse, keyboard, and application control |
| Verification | `momobot.verification` | Post-action state comparison and success detection |
| Learning | `momobot.learning` | Updates memory and improves decision reliability |
| Agent Loop | `momobot.agent` | Orchestrates the full perception–action cycle |
| CLI | `momobot.cli` | Typer-based command-line interface |

## Installation

```bash
cd momobot
pip install -e ".[dev]"

# Optional: enable local Whisper transcription
pip install -e ".[whisper]"
```

## Configuration

Copy `.env.example` to `.env` (or `.env.local`) in the project root and fill in:

```
ANTHROPIC_API_KEY=...
OPENAI_API_KEY=...          # optional — for Whisper API transcription
QDRANT_URL=...              # optional — for vector memory
QDRANT_API_KEY=...          # optional
MOMOBOT_DB_PATH=./momobot.db  # SQLite path for local memory
```

## Usage

```bash
# Run the agent with a goal
momobot run --goal "Open the browser and search for today's news"

# Run interactively (prompts for goals each cycle)
momobot run --interactive

# Inspect cognition mesh state
momobot status

# List stored skills
momobot skills list

# List stored workflows
momobot workflows list

# Replay a workflow by ID
momobot workflows replay <workflow_id>
```

## Agent Cycle

Each tick of the agent performs the following steps:

1. **Observe** — capture screen, optional camera frame, optional audio clip, active window state, system metrics
2. **Structure** — run OCR/vision analysis to extract structured context from raw observations
3. **Retrieve** — query workflow, skill, and failure memory relevant to the current goal and screen state
4. **Decide** — send structured context + memory to Claude to select the next best action
5. **Execute** — perform the action (mouse click, key press, type text, open app, etc.)
6. **Verify** — capture post-action screen state and compare with expected outcome
7. **Learn** — write the experience to the appropriate memory store(s)
8. **Update** — refresh the cognition mesh with new state

## Policy & Safety

- Only operates within the **authorized application list** configured in `.env` or the runtime config
- Every action is **logged** with full observation context (audit trail)
- The agent **pauses** when a verification step detects an unexpected state and asks for human confirmation
- Sensitive input fields (password boxes) are **never logged** — content is masked
- Destructive actions (file deletion, form submission) require explicit `--allow-destructive` flag
