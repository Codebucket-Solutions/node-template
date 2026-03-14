# Execution Plan: generalize-upload-middleware

- Status: completed
- Owner: unassigned
- Scope: Generalize route-facing Multer middleware

## Goal

Generalize the route-facing Multer middleware so routes can build feature-specific upload middleware from shared factories instead of duplicating Multer setup.

## Acceptance criteria

- [x] `middleware/multer.js` uses shared builders for storage-backed upload middleware and validation filters.
- [x] Route-facing upload middleware can be composed from reusable factories.
- [x] Adding a new upload type only requires a small config block instead of duplicating Multer setup.
- [x] Verification passes.

## Checklist

- [x] Inspect existing implementation
- [x] Implement smallest useful change
- [x] Update docs if needed
- [x] Run verification

## Verification notes

- `npm run verify` passed on 2026-03-15.
