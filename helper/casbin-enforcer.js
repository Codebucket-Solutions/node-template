const casbin = require("casbin");
const path = require("path");
const { SequelizeAdapter } = require("casbin-sequelize-adapter");

let enforcerPromise;

async function createCasbinEnforcer() {
	const adapter = await SequelizeAdapter.newAdapter({
		username: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
		host: process.env.DB_HOST,
		dialect: "mysql",
	});

	return casbin.newEnforcer(path.join(__dirname, "..", "models", "casbin-model.conf"), adapter);
}

async function getCasbinEnforcer() {
	if (!enforcerPromise) {
		enforcerPromise = createCasbinEnforcer().catch(error => {
			enforcerPromise = null;
			throw error;
		});
	}

	return enforcerPromise;
}

module.exports = {
	getCasbinEnforcer,
};
