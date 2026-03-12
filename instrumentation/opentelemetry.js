const logger = require("../utils/logger");

let state = {
	enabled: false,
	started: false,
	handle: null,
};

function isTelemetryEnabled() {
	return ["1", "true", "yes", "on"].includes(
		String(process.env.OTEL_ENABLED || "").toLowerCase(),
	);
}

async function startOpenTelemetry() {
	if (state.started) {
		return state.handle;
	}

	if (!isTelemetryEnabled()) {
		return null;
	}

	const serviceName =
		process.env.OTEL_SERVICE_NAME || process.env.LOGSERVER_APPLICATION || "node-template";
	const exporterEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || null;

	state = {
		enabled: true,
		started: true,
		handle: {
			serviceName,
			exporterEndpoint,
			startedAt: new Date().toISOString(),
		},
	};

	logger.warn(
		{
			serviceName,
			exporterEndpoint,
		},
		"OpenTelemetry bootstrap stub enabled. Replace instrumentation/opentelemetry.js with a real SDK setup before relying on traces or metrics.",
	);

	return state.handle;
}

async function shutdownOpenTelemetry(signal = "shutdown") {
	if (!state.started) {
		return;
	}

	logger.info(
		{
			signal,
			serviceName: state.handle.serviceName,
		},
		"OpenTelemetry bootstrap stub stopped.",
	);

	state = {
		enabled: false,
		started: false,
		handle: null,
	};
}

module.exports = {
	isTelemetryEnabled,
	startOpenTelemetry,
	shutdownOpenTelemetry,
};
