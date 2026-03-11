# Workflow

## Standard human workflow

1. Create a branch.
2. Make the smallest useful change.
3. Run `npm run verify`.
4. Update docs if architecture or usage changed.
5. Commit and open a PR.

## Codex app workflow

1. Open the repo in the Codex app or IDE extension.
2. Trust the project so project-scoped `.codex/config.toml` can load.
3. Configure a local environment in the Codex app using the commands in `.codex/README.md`.
4. Start work in Local mode for exploration.
5. Switch to Worktree mode for isolated implementation tasks.
6. Use `npm run worktree:bootstrap` in each new worktree.
7. Use active execution plans in `docs/exec-plans/active/` for medium or large tasks.
8. Run `npm run verify` before review or merge.

## Worktree workflow

```sh
git worktree add ../wt-feature-name -b feature/name
cd ../wt-feature-name
npm run worktree:bootstrap
```

## Plan lifecycle

- Create a new plan with `npm run plan:new -- --slug=<slug> --title="<title>"`.
- Keep status, acceptance criteria, and verification notes current.
- Move finished plans from `docs/exec-plans/active/` to `docs/exec-plans/completed/`.
