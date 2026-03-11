const cron = require("node-cron");
const { sampleScheduledTask } = require("./cron-timer");

const registerCronJobs = () => {
	cron.schedule("0 0 0 * * *", sampleScheduledTask);
};

module.exports = {
	registerCronJobs,
};
