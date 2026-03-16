# Architecture

This repository is an additive enhancement of the existing Node.js backend template. The original application structure remains the primary runtime architecture.

## Runtime architecture

```text
Process bootstrap -> Environment loading -> Optional instrumentation -> Request -> Routes -> Middleware -> Controllers -> Services -> Models -> Database
```

## Harness-engineering overlay

The repository also includes a repo-native operating layer designed for Codex and other coding agents:

- `AGENTS.md`: short operational contract for agents.
- `docs/`: versioned system of record for architecture, workflow, quality, reliability, and security.
- `docs/MIGRATIONS.md`: canonical schema-change workflow for downstream projects.
- `docs/OBSERVABILITY.md`: local logs, metrics, traces, and query workflows.
- `docs/exec-plans/`: checked-in execution plans for task tracking.
- `.codex/`: project-scoped Codex configuration.
- `migrations/`: repository-local schema changes managed through Umzug.
- `scripts/`: deterministic setup, verification, and plan-generation helpers.
- `.github/workflows/`: mechanical enforcement in CI.

## Architectural principle

Application code and repo operations are separate concerns:

- App code continues to live in `app.js`, `routes/`, `middleware/`, `models/`, `helper/`, and `utils/`.
- Model registration lives in `models/models.js` so startup sync-plus-migration bootstrap and migration tooling operate on the same Sequelize definitions.
- Shared environment loading lives in `config/load-env.js` and is used by both `bin/www` and `app.js`.
- Package-backed integrations for uploads, SMS, mail, PDF rendering, and pagination live in `utils/`, with mounted example flows under `routes/v1/examples/`, `controllers/v1/examples/`, and `service/v1/examples/`.
- Shared SQL pagination query generation belongs in `utils/pagination.js`, backed by `pagi-help/v2`, so services do not hand-roll `LIMIT`/`OFFSET`, count, or cursor query fragments.
- Runtime observability bootstrap lives in `instrumentation/` and is loaded from `bin/www` before `app.js`.
- Migration execution lives in `config/migrator.js`, runs from `init.js` during master startup with `sync: true`, and is also exposed through npm scripts instead of direct ad hoc DB changes.
- A lightweight unauthenticated health endpoint lives at `GET /v1/health` so smoke tests can verify startup without requiring seeded DB permissions.
- Stateful business workflows can be implemented in `service/v1/` with Sequelize models backing assignment, workflow action, and escalation rules.
- Agent operating guidance lives in repo-root docs and scripts.

This keeps the backend template usable for normal development while making the repository legible to Codex.
