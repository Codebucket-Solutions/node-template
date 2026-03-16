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

`npm run worktree:bootstrap` creates `.env.worktree` with worktree-local app and stack ports plus a unique compose project name, so Codex worktrees do not fight over the same local Docker resources.

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
- Claim check -> `npm run claim:check`
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

If a local task needs the app to boot without running startup DB bootstrap, use:

```sh
SKIP_STARTUP_MIGRATIONS=true npm run start:dev
```

This is a local-only escape hatch for agent workflows. Do not use it in deployment.

If startup bootstrap is meant to target a non-worktree database in deployment, set:

```sh
ALLOW_NON_LOCAL_STARTUP_DB_BOOTSTRAP=true npm run start
```

Without that override, `init.js` only bootstraps against the expected worktree-local DB target while it is reachable.

## 8. Claim non-trivial tasks in `docs/exec-plans/`

Before making a medium or large change:

1. Run `npm run claim:check` and inspect `docs/exec-plans/active/` for overlapping claim scopes.
2. Create or update a plan with `npm run plan:new -- --slug=<slug> --title="<title>"`.
3. Fill the claim metadata so other agents can see the owner, branch, worktree, and scope. Prefer concrete files, paths, domains, or behaviors in `Claim Scope` so overlap warnings are useful.
