const sequelize = require("../../../config/db");
const { ErrorHandler, statusCodes } = require("../../../helper");
const {
	matchesStructuredValue,
	resolveContextValue,
	toModelNameCandidates,
} = require("./workflow-support");

const { SERVER_ERROR, BAD_GATEWAY } = statusCodes;

class AssigneeResolver {
	#normalize(spec = {}) {
		if (
			spec &&
			typeof spec === "object" &&
			spec.resolver &&
			typeof spec.resolver === "object"
		) {
			return { resolver: spec.resolver, context: spec.context || {} };
		}

		const resolverKey = spec?.resolverKey;
		const context = spec?.context || {};
		if (!resolverKey) {
			return { resolver: null, context };
		}
		return { resolver: null, context };
	}

	async resolve(spec = {}, existingTx = null) {
		const { resolver, context } = this.#normalize(spec);
		if (!resolver) {
			throw new ErrorHandler(BAD_GATEWAY, "resolver spec is required");
		}

		const exec = async transaction => {
			const mode = String(resolver.mode || "").toUpperCase();
			if (mode === "STATIC") {
				if (
					!resolver.assigneeType ||
					resolver.assigneeId === null ||
					resolver.assigneeId === undefined
				) {
					throw new ErrorHandler(
						BAD_GATEWAY,
						"STATIC resolver requires assigneeType and assigneeId",
					);
				}

				return {
					assigneeType: String(resolver.assigneeType).toUpperCase(),
					assigneeId: String(resolver.assigneeId),
				};
			}

			if (mode !== "LOOKUP") {
				throw new ErrorHandler(BAD_GATEWAY, `Unsupported resolver mode: ${resolver.mode}`);
			}

			const model =
				sequelize.models[
					toModelNameCandidates(resolver.table || resolver.model).find(
						name => sequelize.models[name],
					)
				];
			if (!model) {
				throw new ErrorHandler(
					BAD_GATEWAY,
					`Model not registered for resolver table: ${resolver.table}`,
				);
			}

			const whereSpec = resolver?.where;
			if (!whereSpec || typeof whereSpec !== "object") {
				throw new ErrorHandler(BAD_GATEWAY, "LOOKUP resolver requires a where object");
			}

			const exactWhere = {};
			const structuredWhere = [];
			for (const [field, specValue] of Object.entries(whereSpec)) {
				const resolvedValue = resolveContextValue(specValue, context);
				if (resolvedValue === null || resolvedValue === undefined) {
					throw new ErrorHandler(
						BAD_GATEWAY,
						`Missing resolver value for field '${field}'`,
					);
				}

				if (
					resolvedValue &&
					typeof resolvedValue === "object" &&
					!Array.isArray(resolvedValue)
				) {
					structuredWhere.push({ field, value: resolvedValue });
				} else {
					exactWhere[field] = resolvedValue;
				}
			}

			const rows = await model.findAll({
				where: exactWhere,
				order: [["id", "ASC"]],
				transaction,
			});

			const match = rows.find(row =>
				structuredWhere.every(({ field, value }) =>
					matchesStructuredValue(row[field], value),
				),
			);

			if (!match) {
				throw new ErrorHandler(
					BAD_GATEWAY,
					`No assignee match found for resolver table: ${resolver.table}`,
				);
			}

			const assigneeType = String(resolver.assigneeType || "USER").toUpperCase();
			const assigneeIdField = resolver.assigneeIdField || "id";
			if (match[assigneeIdField] === null || match[assigneeIdField] === undefined) {
				throw new ErrorHandler(
					BAD_GATEWAY,
					`Resolver result field '${assigneeIdField}' is missing on table ${resolver.table}`,
				);
			}

			return { assigneeType, assigneeId: String(match[assigneeIdField]) };
		};

		try {
			if (existingTx) {
				return await exec(existingTx);
			}
			return await sequelize.transaction(exec);
		} catch (error) {
			console.error(error);
			if (error.statusCode) {
				throw error;
			}
			throw new ErrorHandler(SERVER_ERROR, error.message || error);
		}
	}
}

module.exports = AssigneeResolver;
