# Execution Plan: multer-middleware-entrypoint

- Status: completed
- Owner: unassigned
- Scope: Add route-facing Multer middleware entry point

## Goal

Add a route-facing Multer middleware module so routes can import reusable upload builders from `middleware/multer`, while keeping `utils/upload.js` as the lower-level `@codebucket/files` utility.

## Acceptance criteria

- [x] `middleware/multer.js` exports route-facing upload helpers in the style expected by route files.
- [x] The middleware composes the existing `@codebucket/files` upload utility instead of re-implementing storage logic.
- [x] Docs/examples point at the middleware entry point.
- [x] Verification passes.

## Checklist

- [x] Inspect existing implementation
- [x] Implement smallest useful change
- [x] Update docs if needed
- [x] Run verification

## Verification notes

- `npm run verify` passed on 2026-03-15.
