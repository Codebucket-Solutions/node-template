# Execution Plan: template-hardening

- Status: active
- Owner: unassigned
- Scope: additive repository hardening for Codex workflows

## Goal

Make the repository easier for Codex and human contributors to operate without changing existing application behavior.

## Acceptance criteria

- Repo-scoped guidance exists.
- Worktree bootstrap is deterministic.
- Verification is available through one command.
- CI runs the baseline checks.

## Checklist

- [x] Add `AGENTS.md`
- [x] Add repo operating docs
- [x] Add scripts for bootstrap, doc validation, quality scoring, and plan generation
- [x] Add CI workflow

## Verification notes

- Run `npm run verify`
