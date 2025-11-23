const DataTypes = require("sequelize").DataTypes;
const _casbin_rule = require("./casbin_rule");
const _sys_dropdown_list = require("./sys_dropdown_list");
const _sys_otp_template = require("./sys_otp_template");
const _sys_tables = require("./sys_tables");

function initModels(sequelize) {
	const casbin_rule = _casbin_rule(sequelize, DataTypes);
	const sys_dropdown_list = _sys_dropdown_list(sequelize, DataTypes);
	const sys_otp_template = _sys_otp_template(sequelize, DataTypes);
	const sys_tables = _sys_tables(sequelize, DataTypes);

	return {
		casbin_rule,
		sys_dropdown_list,
		sys_otp_template,
		sys_tables,
	};
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
