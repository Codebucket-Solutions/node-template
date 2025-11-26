const sequelize = require("./config/db");
const { sampleScheduledTask } = require("./helper/cron-timer");

function initMaster() {
	console.log("Master Initialization...");

	return sequelize
		.sync()
		.then(() => {
			console.log("Database connected");

			// CRON Jobs
			sampleScheduledTask();
			console.log("Cron jobs started");
		})
		.catch(err => {
			console.error("❌ Database connection failed:", err.message);
			throw err;
		});
}

module.exports = initMaster;
