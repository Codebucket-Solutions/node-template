# Execution Plan: simplify-multer-upload-utils

- Status: completed
- Owner: unassigned
- Scope: Simplify Multer upload utilities around @codebucket/files

## Goal

Rewrite the Multer upload utility into a simpler pattern that matches the repository's intended `@codebucket/files` usage: export the shared uploader, create storage from `createMulterUploader(...)`, and expose straightforward single/array upload helpers plus a Multer error wrapper.

## Acceptance criteria

- [x] `utils/upload.js` uses a clear `uploader + createMulterUploader(...) + multer(...).single/array(...)` structure.
- [x] The shared upload utility exports are simpler and easier to compose from routes or middleware files.
- [x] Docs/examples reflect the simplified pattern.
- [x] Verification passes after the rewrite.

## Checklist

- [x] Inspect existing implementation
- [x] Implement smallest useful change
- [x] Update docs if needed
- [x] Run verification

## Verification notes

- `npm run verify` passed on 2026-03-15.
