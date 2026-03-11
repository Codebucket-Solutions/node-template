const sampleScheduledTask = async () => {
	console.log(`[CRON Job] Execution started: ${new Date().toLocaleString()}`);

	try {
		// --- Your scheduled logic goes here ---
		console.log("Task successfully completed its job.");
	} catch (error) {
		console.error("An error occurred during scheduled task execution:", error);
	}
};

module.exports = {
	sampleScheduledTask,
};
