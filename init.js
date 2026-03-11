const sequelize = require("./config/db");
const { registerCronJobs } = require("./helper/cron");

function initMaster() {
	console.log("Master Initialization...");

	return sequelize
		.sync()
		.then(() => {
			console.log("Database connected");

			registerCronJobs();
			console.log("Cron jobs started");
		})
		.catch(err => {
			console.error("❌ Database connection failed:", err.message);
			throw err;
		});
}

module.exports = initMaster;
