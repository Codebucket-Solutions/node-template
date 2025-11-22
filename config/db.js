const Sequelize = require("sequelize");
const { createNamespace } = require("cls-hooked");
const { getOrThrow } = require("../helper/error-handler");

const cls = createNamespace("transaction-namespace"); // any string
Sequelize.useCLS(cls);

const sequelize = new Sequelize(
	getOrThrow("DB_NAME"), // Database name
	getOrThrow("DB_USER"), // Username
	getOrThrow("DB_PASSWORD"), // Password
	{
		dialect: "mysql",
		host: getOrThrow("DB_HOST"),
		timezone: "+05:30",
		dialectOptions: {
			multipleStatements: true,
			decimalNumbers: true,
		},
		define: {
			// Prevent Sequelize from pluralizing table names
			freezeTableName: true,
		},
		logging: false,
		pool: {
			max: 1000,
			min: 0,
			acquire: 30000,
			idle: 10000,
		},
	},
);

module.exports = sequelize;
