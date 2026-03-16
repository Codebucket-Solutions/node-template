# AGENTS.md

This repository is a Node.js backend template maintained for human developers and Codex.

## Read this first

1. `README.md`
2. `docs/README.md`
3. `docs/ARCHITECTURE.md`
4. `docs/WORKFLOW.md`
5. `docs/QUALITY.md`
6. Active plan files under `docs/exec-plans/active/`

## Operating rules

- Keep changes small and verifiable.
- Do not delete existing template features unless the task explicitly requires it.
- Prefer extending existing patterns over introducing parallel patterns.
- Before adding backend behavior, inspect and extend the existing bootstrap and request path first:
  `bin/www` -> `init.js` -> `app.js` -> `middleware/` -> `routes/` -> `controllers/` -> `service/` -> `db/`.
- Do not introduce alternate startup flows, duplicate middleware stacks, or temporary persistence layers when the template already has a place for the behavior.
- For persistent schema changes, add a migration under `migrations/` with `npm run migration:new -- --name=<slug>` and use the migration runner scripts. Do not rely on ad hoc database edits or only `sequelize.sync()` for long-term schema evolution.
- For migration work, use the existing repository structure only: `migrations/`, `scripts/new-migration.js`, `scripts/run-migrations.js`, `config/migrator.js`, and the master-startup path in `init.js`. Do not invent alternate migration folders, custom runners, new metadata tables, ORM-specific parallel migration systems, or one-off startup processes unless the task explicitly requires replacing the canonical flow.
- `SKIP_STARTUP_MIGRATIONS=true` is a local agent escape hatch for tasks that need the app to boot without touching the database bootstrap path in `init.js`. Do not set it in deployment or rely on it for real schema-changing validation.
- Startup DB bootstrap in `init.js` is guarded. Without `ALLOW_NON_LOCAL_STARTUP_DB_BOOTSTRAP=true`, it may only run against the expected worktree-local DB target from `.env.worktree` while that DB is reachable. Use the override only in deployment or another environment that intentionally bootstraps a non-local DB.
- For multi-agent work, inspect `docs/exec-plans/active/` first, run `npm run claim:check`, and respect existing claims. Before starting non-trivial work, create or update a plan with claim metadata for scope, worktree, branch, and claim status. Do not overlap another active claim without narrowing scope or recording a handoff in the plan.
- Read a file before changing it.
- Create or update an execution plan before starting any non-trivial work.
- Keep the execution plan current while implementing the task.
- Update docs when behavior, architecture, or workflow changes.
- Run verification before declaring work done.

## Definition of done

A task is complete only when:

- implementation is present,
- docs are updated when needed,
- `npm run verify` passes, or failures are explained precisely,
- plan file status is updated if the task used an execution plan.

## Where things live

- Product and engineering guidance: `docs/`
- Active execution plans: `docs/exec-plans/active/`
- Completed execution plans: `docs/exec-plans/completed/`
- Codex project config: `.codex/`
- Database migrations: `migrations/`
- Worktree/bootstrap helpers: `scripts/`

## Command preferences

- Use `npm run verify` for the standard local verification flow.
- Use `npm run worktree:bootstrap` in new worktrees.
- Use `npm run dev:stack:up` only after `npm run worktree:bootstrap` so stack ports and compose project names are worktree-local.
- Use `npm run plan:new -- --slug=<slug> --title="<title>"` to create a new execution plan.
- Use `npm run claim:check` before starting medium or large work so active claim overlap warnings are visible early.
- Use `npm run migration:new -- --name=<slug>` to scaffold schema changes.
- Use `npm run migrate` and `npm run migrate:status` to apply or inspect migrations.
- Use `SKIP_STARTUP_MIGRATIONS=true npm run start:dev` only for local non-DB tasks when startup DB bootstrap is intentionally being bypassed.

## Constraints

- Preserve the existing non-agentic template structure and behavior.
- Additive improvements are preferred to replacements.

## Canonical integrations

- Use `@codebucket/files` through `utils/upload.js` and `middleware/multer.js`
  for file uploads and downloads. Do not introduce `formidable`, raw S3 upload
  clients, or parallel temp-file pipelines when this integration fits.
- Use `@codebucket/sms` through `utils/message.js` for SMS delivery. Do not add
  provider-specific HTTP clients directly in controllers or services.
- Use `@codebucket/mail-transport` through `utils/mail.js` with Nodemailer for
  non-SMTP gateway email delivery. Do not hand-roll direct gateway calls when
  this transport fits.
- Use `@codebucket/puppet-master` through `utils/pdf.js` for HTML-to-PDF
  rendering. Do not add local Puppeteer or Playwright PDF stacks for the same
  job.
- Use `pagi-help/v2` through `utils/pagination.js` for offset and cursor
  pagination query generation. Do not hand-build `LIMIT`/`OFFSET`, count
  queries, or cursor token SQL if the package can do the work.
- Check `routes/v1/examples/`, `controllers/v1/examples/`, and
  `service/v1/examples/` before implementing these behaviors elsewhere. Extend
  those patterns instead of creating parallel ones.
- Use the built-in migration flow for schema changes. Do not add Sequelize CLI migrations, Knex migrations, Prisma migrations, raw SQL runner directories, or custom schema-version scripts alongside the existing Umzug-based process.
