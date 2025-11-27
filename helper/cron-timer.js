const cron = require("node-cron");

const sampleScheduledTask = async () => {
	console.log(`[CRON Job] Execution started: ${new Date().toLocaleString()}`);

	try {
		// --- Your scheduled logic goes here ---
		console.log("Task successfully completed its job.");
	} catch (error) {
		console.error("An error occurred during scheduled task execution:", error);
	}
};

// --- Setting the CRON Schedule ---

// Format: second minute hour day-of-month month day-of-week
// * Second: 0-59
// * Minute: 0-59
// * Hour: 0-23
// * Day-of-month: 1-31
// * Month: 1-12 (or jan-dec)
// * Day-of-week: 0-7 (0 or 7 = Sunday, 1 = Monday)

// Current Schedule: Run Every day, at exactly 12:00:00 AM (midnight).
cron.schedule(`0 0 0 * * *`, sampleScheduledTask);

module.exports = {
	sampleScheduledTask,
};
