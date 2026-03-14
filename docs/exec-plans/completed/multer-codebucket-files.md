# Execution Plan: multer-codebucket-files

- Status: completed
- Owner: unassigned
- Scope: Replace Formidable with Multer and @codebucket/files

## Goal

Remove Formidable from the template and standardize uploads around Multer plus `@codebucket/files`, with the upload middleware utility living in the existing `utils/upload.js` helper.

## Acceptance criteria

- [x] `formidable` is removed from project dependencies and `multer` is present.
- [x] `utils/upload.js` exposes a Multer utility built with `createMulterUploader(...)` from `@codebucket/files`.
- [x] Upload response helpers consume Multer file metadata instead of temp-file paths from Formidable.
- [x] Docs reflect the Multer-based upload pattern.

## Checklist

- [x] Inspect existing implementation
- [x] Implement smallest useful change
- [x] Update docs if needed
- [x] Run verification

## Verification notes

- `npm run verify` passed on 2026-03-15.
