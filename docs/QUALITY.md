# Quality

## Baseline checks

- ESLint
- Prettier formatting check
- Architecture inventory generation
- Documentation validation
- Repository quality score generation
- API health integration test
- Runtime smoke test

## Schema change rule

For persistent schema changes, use the migration generator and runner documented in `docs/MIGRATIONS.md`.
Do not introduce a second migration process beside the existing Umzug-based flow.

## Standard command

```sh
npm run verify
```

## Quality goals

- Small diffs over broad rewrites
- Update docs when behavior or architecture changes
- Keep instructions discoverable from the repo root
- Ensure worktree setup is deterministic
- Keep health and smoke verification bootable without requiring a live DB
- Keep local observability reachable from the terminal

## Recommended quality dimensions

Use these dimensions when evaluating a downstream project built from this template:

| Area                  | What to assess                                                                  |
| --------------------- | ------------------------------------------------------------------------------- |
| Repo operating layer  | Docs, plans, CI, and Codex actions stay coherent and current.                   |
| Runtime verification  | Health, smoke, integration, and service-level checks reflect real behavior.     |
| Observability harness | Logs, metrics, and traces are reachable and useful in local development.        |
| Knowledge base        | Design docs, product specs, and debt tracking stay discoverable and maintained. |

## Output artifacts

- `docs/references/quality-score.json`
- `docs/references/architecture-inventory.json`
