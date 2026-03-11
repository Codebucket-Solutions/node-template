# Reliability

## Goals

- New worktrees should be bootstrappable with one command.
- Verification should be deterministic and easy to repeat.
- Documentation should stay fresh enough for Codex to use as a system of record.

## Reliability controls

- `scripts/worktree-bootstrap.sh`
- `scripts/validate-docs.js`
- `scripts/score-quality.js`
- CI workflow under `.github/workflows/ci.yml`

## Operational note

If a verify step fails due to missing local services such as MySQL or Redis, record the exact failure in the active plan and keep the remaining checks passing.
