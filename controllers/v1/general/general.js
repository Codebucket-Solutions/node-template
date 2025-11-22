// const sequelize = require("../../../config/db");

const createApi = async (req, res, next) => {
	try {
		console.log("Create Api");
	} catch (error) {
		next(error);
	}
};

module.exports = {
	createApi,
};
