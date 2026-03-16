const axios = require("axios");

function parseArgs(argv) {
	const [signalType, ...rest] = argv;
	const options = {};
	let query = "";

	for (const arg of rest) {
		if (!arg.startsWith("--")) {
			query = query ? `${query} ${arg}` : arg;
			continue;
		}

		const [key, value] = arg.slice(2).split("=");
		options[key] = value === undefined ? "true" : value;
	}

	return {
		signalType,
		query: query.trim(),
		options,
	};
}

function requireSignalType(signalType) {
	if (!signalType) {
		throw new Error("Usage: node scripts/query-observability.js <logs|metrics|traces> <query>");
	}
}

async function queryMetrics(query) {
	const baseUrl = process.env.PROMETHEUS_BASE_URL || "http://127.0.0.1:9090";
	const response = await axios.get(`${baseUrl}/api/v1/query`, {
		params: {
			query,
		},
	});

	return response.data;
}

async function queryLogs(query, options) {
	const baseUrl = process.env.LOKI_URL || "http://127.0.0.1:3100";
	const response = await axios.get(`${baseUrl}/loki/api/v1/query`, {
		params: {
			query,
			limit: options.limit || 100,
		},
	});

	return response.data;
}

async function queryTraces(query, options) {
	const baseUrl = process.env.TEMPO_BASE_URL || "http://127.0.0.1:3200";
	const response = await axios.get(`${baseUrl}/api/search`, {
		params: {
			q: query,
			limit: options.limit || 20,
		},
	});

	return response.data;
}

async function main() {
	const { signalType, query, options } = parseArgs(process.argv.slice(2));
	requireSignalType(signalType);

	if (!query) {
		throw new Error("A query string is required.");
	}

	let payload;
	switch (signalType) {
		case "metrics":
			payload = await queryMetrics(query);
			break;
		case "logs":
			payload = await queryLogs(query, options);
			break;
		case "traces":
			payload = await queryTraces(query, options);
			break;
		default:
			throw new Error(`Unsupported signal type: ${signalType}`);
	}

	console.log(JSON.stringify(payload, null, 2));
}

main().catch(error => {
	console.error(error.message);
	process.exit(1);
});
