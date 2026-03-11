const _assigner_rule = require("./assigner_rule");
const _assignment = require("./assignment");
const DataTypes = require("sequelize").DataTypes;
const _casbin_rule = require("./casbin_rule");
const _sys_dropdown_list = require("./sys_dropdown_list");
const _sys_otp_template = require("./sys_otp_template");
const _sys_tables = require("./sys_tables");
const _workflow_action = require("./workflow_action");
const _workflow_application_registry = require("./workflow_application_registry");
const _workflow_escalation_matrix = require("./workflow_escalation_matrix");

function initModels(sequelize) {
	const assigner_rule = _assigner_rule(sequelize, DataTypes);
	const assignment = _assignment(sequelize, DataTypes);
	const casbin_rule = _casbin_rule(sequelize, DataTypes);
	const sys_dropdown_list = _sys_dropdown_list(sequelize, DataTypes);
	const sys_otp_template = _sys_otp_template(sequelize, DataTypes);
	const sys_tables = _sys_tables(sequelize, DataTypes);
	const workflow_action = _workflow_action(sequelize, DataTypes);
	const workflow_application_registry = _workflow_application_registry(sequelize, DataTypes);
	const workflow_escalation_matrix = _workflow_escalation_matrix(sequelize, DataTypes);

	return {
		assigner_rule,
		assignment,
		casbin_rule,
		sys_dropdown_list,
		sys_otp_template,
		sys_tables,
		workflow_action,
		workflow_application_registry,
		workflow_escalation_matrix,
	};
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
