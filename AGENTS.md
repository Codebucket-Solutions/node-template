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
- Worktree/bootstrap helpers: `scripts/`

## Command preferences

- Use `npm run verify` for the standard local verification flow.
- Use `npm run worktree:bootstrap` in new worktrees.
- Use `npm run plan:new -- --slug=<slug> --title="<title>"` to create a new execution plan.

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
