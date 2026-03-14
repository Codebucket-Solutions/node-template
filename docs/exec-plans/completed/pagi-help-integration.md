# Execution Plan: pagi-help-integration

- Status: completed
- Owner: unassigned
- Scope: Install and standardize pagi-help usage

## Goal

Install `pagi-help` and add a single shared pagination utility that keeps the
template on the package's `v2` API instead of introducing custom SQL
pagination builders. Document the service-layer usage so future list endpoints
use `pagi-help` for offset and cursor pagination.

## Acceptance criteria

- [x] `pagi-help` is present in the dependency tree.
- [x] The template exposes a shared pagination utility backed by `pagi-help/v2`.
- [x] Documentation points services to the shared helper instead of hand-built pagination SQL.
- [x] `npm run verify` passes.

## Checklist

- [x] Inspect existing implementation
- [x] Implement smallest useful change
- [x] Update docs if needed
- [x] Run verification

## Verification notes

- `npm run verify` passed on March 15, 2026.
