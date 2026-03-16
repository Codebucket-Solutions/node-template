# Workflow

## Standard human workflow

1. Create a branch.
2. Start the local stack when you need DB, Redis, or observability: `npm run dev:stack:up`.
3. Make the smallest useful change.
4. For schema changes, create a migration with `npm run migration:new -- --name=<slug>`. Use the built-in migration flow only; do not create a parallel migration process.
5. Run `npm run verify`.
6. Update docs if architecture or usage changed.
7. Commit and open a PR.

## Codex app workflow

1. Open the repo in the Codex app or IDE extension.
2. Trust the project so project-scoped `.codex/config.toml` can load.
3. Configure a local environment in the Codex app using the commands in `.codex/README.md`.
4. Start work in Local mode for exploration.
5. Switch to Worktree mode for isolated implementation tasks.
6. Use `npm run worktree:bootstrap` in each new worktree.
7. Use `npm run dev:stack:up` when the task needs local DB, Redis, or observability services. The command now uses worktree-local compose project names and ports from `.env.worktree`.
8. Run `npm run claim:check` and use active execution plans in `docs/exec-plans/active/` for medium or large tasks. Respect any existing claim that overlaps your intended scope.
9. Use `npm run migration:new -- --name=<slug>` for schema changes. Master startup bootstraps models and applies pending migrations through the built-in migrator only when the DB target matches the expected worktree-local stack or `ALLOW_NON_LOCAL_STARTUP_DB_BOOTSTRAP=true` is set for an intentional deployment-style environment. For local non-DB tasks, agents may temporarily use `SKIP_STARTUP_MIGRATIONS=true` to bypass the startup bootstrap path. Do not add a second migration tool or alternate startup path.
10. Run `npm run verify` before review or merge.

## Worktree workflow

```sh
git worktree add ../wt-feature-name -b feature/name
cd ../wt-feature-name
npm run worktree:bootstrap
npm run dev:stack:up
```

## Plan lifecycle

- Create a new plan with `npm run plan:new -- --slug=<slug> --title="<title>"`.
- Run `npm run claim:check` before claiming a medium or large task.
- Fill the claim metadata before coding so other agents can see the owner, worktree, branch, and scope.
- If another active plan overlaps your scope, narrow your change or record a handoff before editing the same area.
- Prefer concrete paths, domains, or behaviors in `Claim Scope` so automated overlap warnings stay useful.
- Keep status, acceptance criteria, and verification notes current.
- Move finished plans from `docs/exec-plans/active/` to `docs/exec-plans/completed/`.
