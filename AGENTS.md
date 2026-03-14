# AGENTS.md

This repository is a Node.js backend template maintained for human developers and Codex.

## Read this first

1. `README.md`
2. `docs/README.md`
3. `docs/ARCHITECTURE.md`
4. `docs/WORKFLOW.md`
5. `docs/QUALITY.md`
6. Active plan files under `docs/exec-plans/active/`

## Operating rules

- Keep changes small and verifiable.
- Do not delete existing template features unless the task explicitly requires it.
- Prefer extending existing patterns over introducing parallel patterns.
- Before adding backend behavior, inspect and extend the existing bootstrap and request path first:
  `bin/www` -> `init.js` -> `app.js` -> `middleware/` -> `routes/` -> `controllers/` -> `service/` -> `db/`.
- Do not introduce alternate startup flows, duplicate middleware stacks, or temporary persistence layers when the template already has a place for the behavior.
- Read a file before changing it.
- Create or update an execution plan before starting any non-trivial work.
- Keep the execution plan current while implementing the task.
- Update docs when behavior, architecture, or workflow changes.
- Run verification before declaring work done.


## Definition of done

A task is complete only when:

- implementation is present,
- docs are updated when needed,
- `npm run verify` passes, or failures are explained precisely,
- plan file status is updated if the task used an execution plan.

## Where things live

- Product and engineering guidance: `docs/`
- Active execution plans: `docs/exec-plans/active/`
- Completed execution plans: `docs/exec-plans/completed/`
- Codex project config: `.codex/`
- Worktree/bootstrap helpers: `scripts/`

## Command preferences

- Use `npm run verify` for the standard local verification flow.
- Use `npm run worktree:bootstrap` in new worktrees.
- Use `npm run plan:new -- --slug=<slug> --title="<title>"` to create a new execution plan.

## Constraints

- Preserve the existing non-agentic template structure and behavior.
- Additive improvements are preferred to replacements.
