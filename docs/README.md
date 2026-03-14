# Documentation

This directory contains detailed usage guides and examples for all template features.

## Available Guides

### [Code Quality](./code-quality.md)

Complete guide for ESLint and Prettier setup with IDE integration for:

- VSCode configuration
- WebStorm configuration
- Pre-commit hooks
- npm scripts for linting and formatting
- CI/CD integration
- Troubleshooting

### [Rate Limiter](./rate-limiter.md)

Complete guide for using the environment-aware rate limiting system with examples for:

- Authentication endpoints
- File uploads
- API endpoints
- Custom rate limiters
- Redis configuration
- Testing and monitoring

### [Pagination](./pagination.md)

Guide for building offset and cursor pagination with `pagi-help/v2` through the shared service-layer utility.

### [Canonical Integrations](./integrations.md)

Guide for the package-backed uploads, SMS, mail, PDF, and pagination patterns that the template expects contributors to reuse.

### [Architecture](./ARCHITECTURE.md)

Repository architecture plus the additive harness-engineering layer for Codex.

### [Workflow](./WORKFLOW.md)

Human and Codex app workflow, including worktree usage.

### [Quality](./QUALITY.md)

Baseline verification rules and repository quality scoring.

### [Security](./SECURITY.md)

Repository and Codex operating constraints for safer changes.

### [Reliability](./RELIABILITY.md)

Deterministic setup and operational guidance for worktrees and CI.

### [Codex App Setup](./CODEX_APP_SETUP.md)

Instructions for configuring Codex app local environments and project actions.

### [OpenTelemetry Stub](./opentelemetry.md)

Overview of the disabled-by-default OpenTelemetry bootstrap hook and how to replace it with a real SDK configuration.

## Coming Soon

Additional documentation will be added for:

- Authentication & Authorization (JWT + Casbin)
- Request Validation (Joi schemas)
- Database Operations (Sequelize transactions)
- Code Generation (Plop templates)
- File Uploads (AWS S3 integration)
- Email Notifications
- Error Handling
- Logging

---

For general overview and quick start, see the main [README](../README.md).

- `SYMPHONY_SETUP.md`: how to use this template with OpenAI Symphony.
