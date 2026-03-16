const logger = require("../utils/logger");
const { NodeSDK } = require("@opentelemetry/sdk-node");
const { getNodeAutoInstrumentations } = require("@opentelemetry/auto-instrumentations-node");
const { OTLPTraceExporter } = require("@opentelemetry/exporter-trace-otlp-http");
const { OTLPMetricExporter } = require("@opentelemetry/exporter-metrics-otlp-http");
const { PeriodicExportingMetricReader } = require("@opentelemetry/sdk-metrics");

let state = {
	enabled: false,
	started: false,
	handle: null,
	sdk: null,
};

function isTelemetryEnabled() {
	return ["1", "true", "yes", "on"].includes(
		String(process.env.OTEL_ENABLED || "").toLowerCase(),
	);
}

function buildExporterUrl(baseUrl, suffix) {
	if (!baseUrl) {
		return null;
	}

	if (baseUrl.endsWith(suffix)) {
		return baseUrl;
	}

	return `${baseUrl.replace(/\/$/, "")}${suffix}`;
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
	const exporterEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://127.0.0.1:4318";
	const traceExporterUrl = buildExporterUrl(exporterEndpoint, "/v1/traces");
	const metricExporterUrl = buildExporterUrl(exporterEndpoint, "/v1/metrics");
	const exportIntervalMillis = Number(process.env.OTEL_METRIC_EXPORT_INTERVAL_MS || 10000);

	process.env.OTEL_SERVICE_NAME = serviceName;

	const sdk = new NodeSDK({
		traceExporter: new OTLPTraceExporter({
			url: traceExporterUrl,
		}),
		metricReader: new PeriodicExportingMetricReader({
			exporter: new OTLPMetricExporter({
				url: metricExporterUrl,
			}),
			exportIntervalMillis,
		}),
		instrumentations: [getNodeAutoInstrumentations()],
	});

	await sdk.start();

	state = {
		enabled: true,
		started: true,
		sdk,
		handle: {
			serviceName,
			exporterEndpoint,
			traceExporterUrl,
			metricExporterUrl,
			startedAt: new Date().toISOString(),
		},
	};

	logger.warn(
		{
			serviceName,
			exporterEndpoint,
			traceExporterUrl,
			metricExporterUrl,
		},
		"OpenTelemetry instrumentation enabled.",
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
			traceExporterUrl: state.handle.traceExporterUrl,
			metricExporterUrl: state.handle.metricExporterUrl,
		},
		"OpenTelemetry instrumentation stopping.",
	);

	if (state.sdk) {
		await state.sdk.shutdown();
	}

	state = {
		enabled: false,
		started: false,
		handle: null,
		sdk: null,
	};
}

module.exports = {
	isTelemetryEnabled,
	startOpenTelemetry,
	shutdownOpenTelemetry,
};
