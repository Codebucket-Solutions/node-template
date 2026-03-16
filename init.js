const { migrator } = require("./config/migrator");
const { registerCronJobs } = require("./helper/cron");

async function initMaster() {
	console.log("Master Initialization...");

	try {
		const result = await migrator({ command: "up", sync: true });
		const executedCount = Array.isArray(result.executed) ? result.executed.length : 0;

		console.log(
			`Database ready; synced models and applied ${executedCount} pending migration(s)`,
		);

		registerCronJobs();
		console.log("Cron jobs started");
	} catch (err) {
		console.error("❌ Database initialization failed:", err.message);
		throw err;
	}
}

module.exports = initMaster;
