# Architecture

This repository is an additive enhancement of the existing Node.js backend template. The original application structure remains the primary runtime architecture.

## Runtime architecture

```text
Request -> Routes -> Middleware -> Controllers -> Services -> Models -> Database
```

## Harness-engineering overlay

The repository also includes a repo-native operating layer designed for Codex and other coding agents:

- `AGENTS.md`: short operational contract for agents.
- `docs/`: versioned system of record for architecture, workflow, quality, reliability, and security.
- `docs/exec-plans/`: checked-in execution plans for task tracking.
- `.codex/`: project-scoped Codex configuration.
- `scripts/`: deterministic setup, verification, and plan-generation helpers.
- `.github/workflows/`: mechanical enforcement in CI.

## Architectural principle

Application code and repo operations are separate concerns:

- App code continues to live in `app.js`, `routes/`, `middleware/`, `models/`, `helper/`, and `utils/`.
- Stateful business workflows can be implemented in `service/v1/` with Sequelize models backing assignment, workflow action, and escalation rules.
- Agent operating guidance lives in repo-root docs and scripts.

This keeps the backend template usable for normal development while making the repository legible to Codex.
