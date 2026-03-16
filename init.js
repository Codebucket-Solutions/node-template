const { migrator } = require("./config/migrator");
const { enforceStartupDbBootstrapGuard, isTruthyEnv } = require("./config/startup-db-guard");
const { registerCronJobs } = require("./helper/cron");

function shouldSkipStartupMigrations() {
	return isTruthyEnv(process.env.SKIP_STARTUP_MIGRATIONS);
}

async function initMaster() {
	console.log("Master Initialization...");

	try {
		if (shouldSkipStartupMigrations()) {
			console.log("Skipping startup database bootstrap because SKIP_STARTUP_MIGRATIONS=true");
		} else {
			const guardDecision = await enforceStartupDbBootstrapGuard();
			console.log(
				`Startup DB bootstrap approved via ${guardDecision.mode} guard for ${guardDecision.host}:${guardDecision.port}`,
			);
			const result = await migrator({ command: "up", sync: true });
			const executedCount = Array.isArray(result.executed) ? result.executed.length : 0;

			console.log(
				`Database ready; synced models and applied ${executedCount} pending migration(s)`,
			);
		}

		registerCronJobs();
		console.log("Cron jobs started");
	} catch (err) {
		console.error("❌ Database initialization failed:", err.message);
		throw err;
	}
}

module.exports = initMaster;
