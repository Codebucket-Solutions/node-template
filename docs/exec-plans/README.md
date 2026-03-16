# Execution Plans

This template ships with `active/` and `completed/` directories, but both are expected to start empty in a fresh project.

Use:

- `active/` for ongoing claimed work
- `completed/` for archived work that belongs to the downstream project, not to the template itself
- [`plan-template.md`](./plan-template.md) as the starter format when you want a manual example

Preferred command:

```sh
npm run plan:new -- --slug=<slug> --title="<title>"
```

Claim overlap warning:

```sh
npm run claim:check
```

## Claim protocol

1. Before starting non-trivial work, run `npm run claim:check` and scan `active/` for overlapping `Claim Scope` entries.
2. Create or update a plan in `active/` and fill `Owner`, `Claim Scope`, `Claim Worktree`, `Claim Branch`, `Claim Status`, and `Claim Updated At`.
3. Treat an active plan as the current claim on that scope. If another plan overlaps, narrow your scope or record a handoff before editing the same area.
4. Use `Claim Status: claimed` for normal work, `blocked` when waiting, and `handoff` when another agent should pick it up.
5. When the task is done, change `- Status:` to `completed`, set `Claim Status: released`, update the verification notes, and move the plan to `completed/`.

## Scope guidance

- Prefer concrete file paths, packages, routes, services, or behaviors in `Claim Scope`.
- Use comma-separated or `|`-separated fragments when the claim spans a few adjacent areas.
- Treat `npm run claim:check` as a warning system, not a lock manager. When in doubt, narrow the scope and record the handoff.
