const sequelize = require("../config/db");
const initModels = require("./init-models");

let models;

function getModels() {
	if (!models) {
		models = initModels(sequelize);
	}

	return models;
}

module.exports = {
	sequelize,
	initModels,
	getModels,
	models: getModels(),
};
