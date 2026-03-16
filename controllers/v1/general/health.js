function getHealth(req, res) {
	res.status(200).json({
		status: "success",
		data: {
			ok: true,
			service: process.env.OTEL_SERVICE_NAME || "node-template",
			environment: process.env.NODE_ENV || "development",
			uptimeSeconds: Number(process.uptime().toFixed(3)),
			timestamp: new Date().toISOString(),
		},
	});
}

module.exports = {
	getHealth,
};
