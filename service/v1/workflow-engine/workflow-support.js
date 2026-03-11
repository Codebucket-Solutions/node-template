const { ErrorHandler, statusCodes } = require("../../../helper");
const sequelize = require("../../../config/db");

const { BAD_GATEWAY } = statusCodes;

const parseJson = value => {
	if (value === null || value === undefined) {
		return null;
	}
	if (typeof value === "string") {
		try {
			return JSON.parse(value);
		} catch {
			return null;
		}
	}
	return value;
};

const getModel = names => {
	for (const name of names) {
		if (sequelize.models[name]) {
			return sequelize.models[name];
		}
	}
	return null;
};

const getWorkflowModels = () => {
	const models = {
		AssignerRule: getModel(["assigner_rule"]),
		Assignment: getModel(["assignment"]),
		WorkflowAction: getModel(["workflow_action"]),
		WorkflowApplicationRegistry: getModel(["workflow_application_registry"]),
		WorkflowEscalationMatrix: getModel(["workflow_escalation_matrix"]),
	};

	for (const [key, model] of Object.entries(models).filter(([name]) =>
		[
			"AssignerRule",
			"Assignment",
			"WorkflowAction",
			"WorkflowApplicationRegistry",
			"WorkflowEscalationMatrix",
		].includes(name),
	)) {
		if (!model) {
			throw new ErrorHandler(BAD_GATEWAY, `${key} model is not registered`);
		}
	}

	return models;
};

const toModelNameCandidates = tableOrModelName => {
	if (!tableOrModelName) {
		return [];
	}

	const base = String(tableOrModelName);
	const pascal = base
		.split(/[_-\s]+/)
		.filter(Boolean)
		.map(part => part.charAt(0).toUpperCase() + part.slice(1))
		.join("");

	return Array.from(new Set([base, base.toLowerCase(), pascal]));
};

const getApplicationAdapter = async (applicationType, transaction = null) => {
	const type = String(applicationType || "").toUpperCase();
	const { WorkflowApplicationRegistry } = getWorkflowModels();
	const config = await WorkflowApplicationRegistry.findOne({
		where: {
			application_type: type,
			is_active: true,
		},
		order: [["id", "DESC"]],
		transaction: transaction || undefined,
	});

	if (!config) {
		throw new ErrorHandler(BAD_GATEWAY, `Unsupported applicationType: ${applicationType}`);
	}

	const model = getModel(toModelNameCandidates(config.model_name));
	if (!model) {
		throw new ErrorHandler(
			BAD_GATEWAY,
			`Model not registered for applicationType: ${applicationType}`,
		);
	}

	return {
		type,
		model,
		idField: config.id_field,
		stageField: config.stage_field,
		currentAssignmentField: config.current_assignment_field,
	};
};

const matchesConditions = (conditions, context) => {
	const parsed = parseJson(conditions);
	if (!parsed || typeof parsed !== "object") {
		return true;
	}

	return Object.entries(parsed).every(([key, value]) => context?.[key] === value);
};

const matchesMapping = (mappingValue, expected) => {
	if (Array.isArray(mappingValue)) {
		return mappingValue.some(entry => matchesMapping(entry, expected));
	}

	if (!mappingValue || typeof mappingValue !== "object") {
		return false;
	}

	return (
		String(mappingValue.key) === String(expected.key) &&
		String(mappingValue.table) === String(expected.table) &&
		String(mappingValue.value) === String(expected.value)
	);
};

const resolveContextValue = (valueSpec, context) => {
	if (valueSpec && typeof valueSpec === "object" && !Array.isArray(valueSpec)) {
		if (Object.prototype.hasOwnProperty.call(valueSpec, "valueFromContext")) {
			const key = String(valueSpec.valueFromContext);
			return (
				context?.[key] ??
				context?.[key.replace(/[A-Z]/g, match => `_${match.toLowerCase()}`)] ??
				null
			);
		}

		if (Object.prototype.hasOwnProperty.call(valueSpec, "value")) {
			return valueSpec.value;
		}

		const out = {};
		for (const [key, value] of Object.entries(valueSpec)) {
			out[key] = resolveContextValue(value, context);
		}
		return out;
	}

	return valueSpec;
};

const matchesStructuredValue = (actual, expected) => {
	if (Array.isArray(actual)) {
		return actual.some(entry => matchesStructuredValue(entry, expected));
	}

	if (expected && typeof expected === "object" && !Array.isArray(expected)) {
		if (!actual || typeof actual !== "object") {
			return false;
		}

		return Object.entries(expected).every(([key, value]) =>
			matchesStructuredValue(actual[key], value),
		);
	}

	return String(actual) === String(expected);
};

module.exports = {
	parseJson,
	getWorkflowModels,
	getApplicationAdapter,
	toModelNameCandidates,
	matchesConditions,
	matchesMapping,
	resolveContextValue,
	matchesStructuredValue,
};
