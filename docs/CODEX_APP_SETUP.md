# Codex App Setup

This repository is prepared for Codex app, Codex IDE extension, and Codex CLI workflows.

## 1. Trust the repository

Open the repository in Codex and trust the project so `.codex/config.toml` is loaded.

## 2. Create a local environment

In the Codex app settings for this project, create a local environment and set the setup script to:

```sh
npm ci || npm install
npm run worktree:bootstrap
```

## 3. Add project actions

Recommended actions:

- Verify -> `npm run verify`
- Migrate -> `npm run migrate`
- Migration status -> `npm run migrate:status`
- Test -> `npm run test`
- Smoke test -> `npm run test:smoke`
- Start dev server -> `npm run start:dev`
- Dev stack up -> `npm run dev:stack:up`
- Dev stack down -> `npm run dev:stack:down`
- Architecture inventory -> `npm run architecture:inventory`
- Validate docs -> `npm run docs:validate`
- Score quality -> `npm run quality:score`
- New plan -> `npm run plan:new -- --slug=<slug> --title="<title>"`

## 4. Use worktrees for isolated tasks

Suggested pattern:

```sh
git worktree add ../wt-task-name -b feature/task-name
cd ../wt-task-name
npm run worktree:bootstrap
npm run dev:stack:up
```

## 5. Use AGENTS.md as the entry point

Keep high-level guidance in `AGENTS.md` and detailed guidance in `docs/`.

## 6. Use the local observability harness when tasks need runtime feedback

For backend tasks that need logs, metrics, or traces:

```sh
npm run dev:stack:up
npm run obs:query -- metrics "up"
```

Detailed setup lives in [`docs/OBSERVABILITY.md`](./OBSERVABILITY.md).

## 7. Use migration scripts for schema changes

For database schema changes:

```sh
npm run migration:new -- --name=add-example-column
npm run migrate
```

Repository guidance lives in [`docs/MIGRATIONS.md`](./MIGRATIONS.md). Do not add a parallel migration tool or alternate schema-change workflow.
