# Execution Plan: config-driven-upload-definitions

- Status: completed
- Owner: unassigned
- Scope: Make route-facing upload definitions config-driven

## Goal

Replace the remaining feature-specific upload names in `middleware/multer.js` with generic builders so the template exposes reusable Multer factories, while examples and app features define their own upload middleware locally.

## Acceptance criteria

- [x] `middleware/multer.js` exports generic builders only, not feature-specific upload names.
- [x] Example/docs code constructs its own upload middleware from those builders.
- [x] Adding a new upload type in app code requires local config only, not template changes.
- [x] Verification passes.

## Checklist

- [x] Inspect existing implementation
- [x] Implement smallest useful change
- [x] Update docs if needed
- [x] Run verification

## Verification notes

- `npm run verify` passed on 2026-03-15.
