const cron = require("node-cron");
const { sampleScheduledTask } = require("./cron-timer");

const cronOptions = { timezone: "Asia/Kolkata" };

const registerCronJobs = () => {
	cron.schedule("0 0 0 * * *", sampleScheduledTask, cronOptions);
};

module.exports = {
	registerCronJobs,
};
