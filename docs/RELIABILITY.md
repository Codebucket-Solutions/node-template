# Reliability

## Goals

- New worktrees should be bootstrappable with one command.
- Verification should be deterministic and easy to repeat.
- Documentation should stay fresh enough for Codex to use as a system of record.
- The app should expose a smoke-testable health endpoint.
- Local developer services should be startable with one command.

## Reliability controls

- `scripts/worktree-bootstrap.sh`
- `scripts/bootstrap-worktree-env.js`
- `scripts/smoke-server.js`
- `scripts/validate-docs.js`
- `scripts/generate-architecture-inventory.js`
- `scripts/score-quality.js`
- `docker-compose.dev.yml`
- CI workflow under `.github/workflows/ci.yml`

## Operational note

`npm run verify` is designed to pass without requiring MySQL or Redis for the smoke path. If a deeper runtime check is added later and requires local services, record the exact failure in the active plan and keep the remaining checks passing.
