# Execution Plan: library-example-flows

- Status: completed
- Owner: unassigned
- Scope: Library Example Flows

## Goal

Add versioned route/controller/service example flows for the template's
canonical package-backed integrations and document that those packages are the
required implementation path for uploads, SMS, mail, PDF rendering, and
pagination.

## Acceptance criteria

- [x] `v1/examples` includes route/controller/service examples for files, SMS,
      mail, PDF rendering, and pagination.
- [x] The examples use the existing shared utilities instead of custom provider
      or SQL implementations.
- [x] `AGENTS.md` and repo docs tell future contributors to prefer the package
      integrations over reinvented implementations.
- [x] `npm run verify` passes.

## Checklist

- [x] Inspect existing implementation
- [x] Implement smallest useful change
- [x] Update docs if needed
- [x] Run verification

## Verification notes

- `npm run verify` passed on March 15, 2026.
