const http = require("http");
const { performance } = require("perf_hooks");

process.env.NODE_ENV = process.env.NODE_ENV || "test";

const { loadEnvironment } = require("../config/load-env");

loadEnvironment(process.env.NODE_ENV);

const app = require("../app");

const startupBudgetMs = Number(process.env.SMOKE_STARTUP_BUDGET_MS || 2000);
const startedAt = performance.now();

function closeServer(server, code = 0, error) {
	server.close(() => {
		if (error) {
			console.error(error.message);
			process.exit(code);
		}

		process.exit(code);
	});
}

const server = http.createServer(app);
server.listen(0, "127.0.0.1", () => {
	const { port } = server.address();
	const request = http.request(
		{
			host: "127.0.0.1",
			port,
			path: "/v1/health",
			method: "GET",
		},
		response => {
			const chunks = [];
			response.on("data", chunk => {
				chunks.push(chunk);
			});

			response.on("end", () => {
				const elapsedMs = performance.now() - startedAt;
				const body = Buffer.concat(chunks).toString("utf8");

				if (response.statusCode !== 200) {
					return closeServer(
						server,
						1,
						new Error(`Smoke check failed with status ${response.statusCode}: ${body}`),
					);
				}

				if (elapsedMs > startupBudgetMs) {
					return closeServer(
						server,
						1,
						new Error(
							`Smoke check exceeded startup budget: ${elapsedMs.toFixed(1)}ms > ${startupBudgetMs}ms`,
						),
					);
				}

				console.log(
					`Smoke check passed in ${elapsedMs.toFixed(1)}ms (budget ${startupBudgetMs}ms).`,
				);
				return closeServer(server);
			});
		},
	);

	request.on("error", error => {
		closeServer(server, 1, error);
	});

	request.end();
});
