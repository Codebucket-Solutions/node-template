const { loadEnvironment } = require("../config/load-env");

loadEnvironment(process.env.NODE_ENV);

const { migrator } = require("../config/migrator");

function parseArgs(argv) {
	const [command = "up", ...rest] = argv;
	const options = {};

	for (const arg of rest) {
		if (!arg.startsWith("--")) {
			continue;
		}

		const [rawKey, rawValue] = arg.slice(2).split("=");
		const key = rawKey.trim();
		const value = rawValue === undefined ? "true" : rawValue.trim();
		options[key] = value;
	}

	return { command, options };
}

function toBoolean(value) {
	return ["1", "true", "yes", "on"].includes(String(value || "").toLowerCase());
}

async function main() {
	const { command, options } = parseArgs(process.argv.slice(2));
	const result = await migrator({
		command,
		sync: toBoolean(options.sync),
		alter: toBoolean(options.alter),
		to: options.to,
		step: options.step ? Number(options.step) : undefined,
	});

	console.log(JSON.stringify(result, null, 2));
}

main().catch(error => {
	console.error(error.stack || error.message);
	process.exit(1);
});
