# Security

## Repository operating guidance

- Keep secrets out of the repository.
- Prefer environment variables or secret managers for runtime configuration.
- Review changes to auth, rate limiting, uploads, mail, and database access carefully.
- Do not weaken validation, authorization, or security middleware without explicit requirements.

## Codex safety guidance

- Default Codex project configuration uses `approval_policy = "on-request"` and `sandbox_mode = "workspace-write"`.
- Review shell commands that install packages, change Git state, or alter deployment files.

## Existing security-related template areas

- `middleware/auth.js`
- `middleware/rate-limiter.js`
- `middleware/validator.js`
- `utils/token.js`
- `utils/hash.js`
- `utils/upload.js`
- `helper/casbin-enforcer.js`
