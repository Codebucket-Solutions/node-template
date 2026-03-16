const { spawnSync } = require("child_process");
const path = require("path");
const { loadEnvironment } = require("../config/load-env");
const { getWorktreeContext } = require("./worktree-context");

loadEnvironment(process.env.NODE_ENV);

const context = getWorktreeContext(process.cwd());

function buildEnvironment() {
	return {
		...process.env,
		COMPOSE_PROJECT_NAME: process.env.COMPOSE_PROJECT_NAME || context.composeProjectName,
		DB_NAME: process.env.DB_NAME || "test_db",
		DB_PORT: process.env.DB_PORT || String(context.dbPort),
		REDIS_PORT: process.env.REDIS_PORT || String(context.redisPort),
		GRAFANA_PORT: process.env.GRAFANA_PORT || String(context.grafanaPort),
		LOKI_PORT: process.env.LOKI_PORT || String(context.lokiPort),
		TEMPO_PORT: process.env.TEMPO_PORT || String(context.tempoPort),
		OTLP_GRPC_PORT: process.env.OTLP_GRPC_PORT || String(context.otlpGrpcPort),
		OTLP_HTTP_PORT: process.env.OTLP_HTTP_PORT || String(context.otlpHttpPort),
		PROMETHEUS_PORT: process.env.PROMETHEUS_PORT || String(context.prometheusPort),
	};
}

function resolveComposeArgs(command) {
	switch (command) {
		case "up":
			return ["up", "-d"];
		case "down":
			return ["down"];
		case "logs":
			return ["logs", "-f", "--tail=100"];
		case "config":
			return ["config"];
		default:
			throw new Error(
				"Usage: node scripts/dev-stack.js <up|down|logs|config> [docker-compose args...]",
			);
	}
}

function main() {
	const [command = "up", ...extraArgs] = process.argv.slice(2);
	const env = buildEnvironment();
	const composeArgs = [
		"compose",
		"-f",
		path.join(process.cwd(), "docker-compose.dev.yml"),
		...resolveComposeArgs(command),
		...extraArgs,
	];

	console.log(
		`Using stack project ${env.COMPOSE_PROJECT_NAME} (db:${env.DB_PORT}, redis:${env.REDIS_PORT}, grafana:${env.GRAFANA_PORT})`,
	);

	const result = spawnSync("docker", composeArgs, {
		env,
		stdio: "inherit",
	});

	if (result.error) {
		console.error(result.error.message);
		process.exit(1);
	}

	process.exit(result.status ?? 0);
}

main();
