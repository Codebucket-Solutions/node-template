# Migrations

Use migrations for persistent schema changes in projects built from this template.

During master startup, `init.js` runs the shared migrator with `sync: true` and then applies pending tracked migrations. The CLI commands below remain useful for manual rollout steps, debugging, and inspection.

## Canonical workflow

Create a migration:

```sh
npm run migration:new -- --name=create-users-table
```

Apply pending migrations:

```sh
npm run migrate
```

Inspect status:

```sh
npm run migrate:status
```

Rollback the latest migration:

```sh
npm run migrate:down
```

Manually mirror the startup bootstrap path against a scratch database:

```sh
npm run migrate -- --sync
```

`--sync` initializes the current model graph before pending migrations are applied. The startup path does this automatically through `config/migrator.js`.

## File location

- Migration files live in `migrations/`
- The runner lives in `config/migrator.js`
- The CLI entrypoints live in `scripts/run-migrations.js` and `scripts/new-migration.js`
- Master startup bootstraps the current model graph and applies pending migrations from `init.js` before workers are forked

## Migration shape

Generated files export `up` and `down` functions:

```js
module.exports = {
	async up(queryInterface, sequelize) {},
	async down(queryInterface, sequelize) {},
};
```

`queryInterface` is the primary migration API. `sequelize` is also passed for cases where direct access to the Sequelize instance is useful.

## Template guidance

- Prefer migrations for schema evolution.
- App startup bootstraps the current model graph and applies pending migrations in the master process before workers are started.
- Use `sync: true` only through the existing migrator flow in `config/migrator.js`; do not reintroduce raw `sequelize.sync()` calls in parallel startup paths.
- Use `npm run migrate -- --sync` when you intentionally want to mirror the startup bootstrap path outside the normal server boot flow.
- Keep migrations additive, reviewable, and reversible when practical.

## Hard rules

- Use only the existing migration structure: `migrations/`, `scripts/new-migration.js`, `scripts/run-migrations.js`, `config/migrator.js`, and `init.js`.
- Do not add parallel migration directories, alternate migration CLIs, separate schema-version tables, or a second migration framework unless the repository is explicitly being migrated away from the current Umzug flow.
- Do not bypass the canonical process with hand-run DDL, ad hoc startup scripts, or undocumented one-off database patch files for normal schema evolution.
