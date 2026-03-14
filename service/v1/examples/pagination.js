const { ErrorHandler, statusCodes } = require("../../../helper");
const { createPaginationHelper, normalizePaginationDialect } = require("../../../utils");

const { BAD_REQUEST } = statusCodes;

const EXAMPLE_TABLE_CONFIGS = [
	{
		tableName: "example_records",
		columnList: [
			{ name: "id", alias: "id" },
			{ name: "name", alias: "name" },
			{ name: "email", alias: "email" },
			{ name: "status", alias: "status" },
			{ name: "created_at", alias: "createdAt" },
		],
		searchColumnList: [{ name: "name" }, { name: "email" }],
	},
];

function columnNameConverter(name) {
	return String(name).replace(/[A-Z]/g, match => `_${match.toLowerCase()}`);
}

function resolveDialect(dialect) {
	try {
		return normalizePaginationDialect(dialect || "mysql");
	} catch (error) {
		throw new ErrorHandler(BAD_REQUEST, error.message);
	}
}

function parsePositiveInteger(value, fallback, fieldName) {
	if (value === undefined || value === null || value === "") {
		return fallback;
	}

	const parsed = Number(value);
	if (!Number.isInteger(parsed) || parsed < 1) {
		throw new ErrorHandler(BAD_REQUEST, `${fieldName} must be a positive integer`);
	}

	return parsed;
}

function createExamplePaginationHelper(dialect) {
	return createPaginationHelper({
		dialect,
		columnNameConverter,
	});
}

function buildFilters(query = {}) {
	if (!query.status) {
		return [];
	}

	return [["status", "=", String(query.status)]];
}

function buildSort() {
	return {
		attributes: ["createdAt"],
		sorts: ["desc"],
	};
}

function buildSearchValue(value) {
	const search = String(value || "").trim();
	return search || undefined;
}

function buildOffsetQueries(helper, paginationOptions) {
	try {
		return helper.paginate(paginationOptions, EXAMPLE_TABLE_CONFIGS);
	} catch (error) {
		throw new ErrorHandler(BAD_REQUEST, error.message);
	}
}

function buildCursorQueries(helper, paginationOptions) {
	try {
		return helper.paginateCursor(paginationOptions, EXAMPLE_TABLE_CONFIGS);
	} catch (error) {
		throw new ErrorHandler(BAD_REQUEST, error.message);
	}
}

const paginateOffsetExampleService = async ({ query = {} }) => {
	const dialect = resolveDialect(query.dialect);
	const helper = createExamplePaginationHelper(dialect);
	const pageNo = parsePositiveInteger(query.pageNo, 1, "pageNo");
	const itemsPerPage = parsePositiveInteger(query.itemsPerPage, 10, "itemsPerPage");
	const paginationOptions = {
		search: buildSearchValue(query.search),
		filters: buildFilters(query),
		sort: buildSort(),
		pageNo,
		itemsPerPage,
	};

	return {
		message: "Offset pagination example generated",
		dialect,
		paginationOptions,
		queries: buildOffsetQueries(helper, paginationOptions),
	};
};

const paginateCursorExampleService = async ({ query = {} }) => {
	const dialect = resolveDialect(query.dialect);
	const helper = createExamplePaginationHelper(dialect);
	const limit = parsePositiveInteger(query.limit, 20, "limit");
	const after = query.after ? String(query.after) : undefined;
	const paginationOptions = {
		search: buildSearchValue(query.search),
		filters: buildFilters(query),
		sort: buildSort(),
		limit,
		after,
	};

	return {
		message: "Cursor pagination example generated",
		dialect,
		paginationOptions: {
			...paginationOptions,
			after: after || null,
		},
		queries: buildCursorQueries(helper, paginationOptions),
	};
};

module.exports = {
	paginateOffsetExampleService,
	paginateCursorExampleService,
};
