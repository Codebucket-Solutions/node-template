const PagiHelpV2 = require("pagi-help/v2");

const SUPPORTED_DIALECTS = new Set(["mysql", "postgres"]);

function normalizePaginationDialect(dialect = "mysql") {
	const normalizedDialect = String(dialect || "mysql")
		.trim()
		.toLowerCase();

	if (!SUPPORTED_DIALECTS.has(normalizedDialect)) {
		throw new Error(`Unsupported pagination dialect "${dialect}". Use "mysql" or "postgres".`);
	}

	return normalizedDialect;
}

function createPaginationHelper(options = {}) {
	const { dialect = "mysql", safeOptions = { validate: true }, ...restOptions } = options;

	return new PagiHelpV2({
		...restOptions,
		dialect: normalizePaginationDialect(dialect),
		safeOptions,
	});
}

const paginationHelper = createPaginationHelper();

function paginate(paginationOptions, tableConfigs, helper = paginationHelper) {
	return helper.paginate(paginationOptions, tableConfigs);
}

function paginateCursor(paginationOptions, tableConfigs, helper = paginationHelper) {
	return helper.paginateCursor(paginationOptions, tableConfigs);
}

function resolveCursorPage(rows, cursorPlan, helper = paginationHelper) {
	return helper.resolveCursorPage(rows, cursorPlan);
}

module.exports = {
	PagiHelpV2,
	normalizePaginationDialect,
	createPaginationHelper,
	paginationHelper,
	paginate,
	paginateCursor,
	resolveCursorPage,
};
