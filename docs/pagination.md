# Pagination

Use `pagi-help/v2` for list-query pagination in services. Do not hand-build `LIMIT`/`OFFSET` clauses, count queries, cursor tokens, or search/filter SQL when the package already provides those primitives.

The template exposes a thin wrapper in `utils/pagination.js` and re-exports it from `utils/index.js`.

## Shared utility

Available exports:

- `createPaginationHelper(options)`
- `paginate(paginationOptions, tableConfigs, helper?)`
- `paginateCursor(paginationOptions, tableConfigs, helper?)`
- `resolveCursorPage(rows, cursorPlan, helper?)`

The default helper uses:

- `pagi-help/v2`
- `dialect: "mysql"`
- `safeOptions.validate: true`

If a service needs PostgreSQL or a `columnNameConverter`, create a helper explicitly with `createPaginationHelper(...)`.

## Offset pagination example

```js
const { QueryTypes } = require("sequelize");
const sequelize = require("../../config/db");
const { paginate } = require("../../utils");

const listUsers = async query => {
	const queries = paginate(
		{
			search: query.search,
			filters: query.status ? [["status", "=", query.status]] : [],
			sort: {
				attributes: ["created_at"],
				sorts: ["desc"],
			},
			pageNo: Number(query.pageNo || 1),
			itemsPerPage: Number(query.itemsPerPage || 10),
		},
		[
			{
				tableName: "user",
				columnList: [
					{ name: "id", alias: "id" },
					{ name: "name", alias: "name" },
					{ name: "email", alias: "email" },
					{ name: "status", alias: "status" },
					{ name: "created_at", alias: "created_at" },
				],
				searchColumnList: [{ name: "name" }, { name: "email" }],
			},
		],
	);

	const users = await sequelize.query(queries.query, {
		replacements: queries.replacements,
		type: QueryTypes.SELECT,
	});

	const [{ count }] = await sequelize.query(queries.totalCountQuery, {
		replacements: queries.replacements,
		type: QueryTypes.SELECT,
	});

	return {
		data: users,
		total: Number(count),
		pageNo: Number(query.pageNo || 1),
		itemsPerPage: Number(query.itemsPerPage || 10),
	};
};
```

## Cursor pagination example

```js
const { QueryTypes } = require("sequelize");
const sequelize = require("../../config/db");
const { createPaginationHelper } = require("../../utils");

const paginationHelper = createPaginationHelper({
	dialect: "postgres",
	columnNameConverter: name => name.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`),
});

const listAuditEvents = async query => {
	const queries = paginationHelper.paginateCursor(
		{
			search: query.search,
			filters: query.stage ? [["stage", "=", query.stage]] : [],
			sort: {
				attributes: ["createdAt"],
				sorts: ["desc"],
			},
			limit: Number(query.limit || 20),
			after: query.after,
		},
		[
			{
				tableName: "audit.events",
				columnList: [
					{ name: "event_id", alias: "id" },
					{ name: "created_at", alias: "createdAt" },
					{ name: "stage", alias: "stage" },
				],
				searchColumnList: [{ name: "stage" }],
			},
		],
	);

	const rows = await sequelize.query(queries.query, {
		replacements: queries.replacements,
		type: QueryTypes.SELECT,
	});

	return paginationHelper.resolveCursorPage(rows, queries.cursorPlan);
};
```

## Intended usage

- Build pagination queries in the service layer, close to the query execution path.
- Keep route and controller code unaware of SQL pagination details.
- Use `pagi-help/v2` through `utils/pagination.js` instead of introducing separate pagination helpers.
- When PostgreSQL behavior is required, create a helper with `dialect: "postgres"` instead of branching on SQL syntax manually.
