const net = require("net");
const { getWorktreeContext } = require("../scripts/worktree-context");

const TRUTHY_ENV_VALUES = new Set(["1", "true", "yes", "on"]);
const LOCAL_DB_HOSTS = new Set(["127.0.0.1", "localhost", "::1", "0.0.0.0"]);

function isTruthyEnv(value) {
	return TRUTHY_ENV_VALUES.has(String(value || "").toLowerCase());
}

function normalizeDbHost(host) {
	return String(host || "")
		.trim()
		.toLowerCase();
}

function buildStartupDbBootstrapPolicy({
	env = process.env,
	root = process.cwd(),
	worktreeContext = getWorktreeContext(root),
} = {}) {
	const host = normalizeDbHost(env.DB_HOST);
	const port = Number(env.DB_PORT || 3306);
	const overrideEnabled = isTruthyEnv(env.ALLOW_NON_LOCAL_STARTUP_DB_BOOTSTRAP);
	const localHost = LOCAL_DB_HOSTS.has(host);
	const matchesWorktreePort = port === worktreeContext.dbPort;
	const requiresGuardBypass = overrideEnabled || (localHost && matchesWorktreePort);

	return {
		host,
		port,
		localHost,
		matchesWorktreePort,
		overrideEnabled,
		requiresGuardBypass,
		expectedDbHost: "127.0.0.1",
		expectedDbPort: worktreeContext.dbPort,
		composeProjectName: worktreeContext.composeProjectName,
		worktreeName: worktreeContext.worktreeName,
	};
}

function probeTcpPort({ host, port, timeoutMs = 1000 }) {
	const probeHost = host === "localhost" ? "127.0.0.1" : host;

	return new Promise(resolve => {
		const socket = net.createConnection({ host: probeHost, port });

		const finish = reachable => {
			socket.removeAllListeners();
			socket.destroy();
			resolve(reachable);
		};

		socket.setTimeout(timeoutMs);
		socket.once("connect", () => finish(true));
		socket.once("timeout", () => finish(false));
		socket.once("error", () => finish(false));
	});
}

async function enforceStartupDbBootstrapGuard({
	env = process.env,
	root = process.cwd(),
	worktreeContext = getWorktreeContext(root),
	probe = probeTcpPort,
} = {}) {
	const policy = buildStartupDbBootstrapPolicy({
		env,
		root,
		worktreeContext,
	});

	if (policy.overrideEnabled) {
		return {
			mode: "override",
			...policy,
		};
	}

	if (!policy.localHost || !policy.matchesWorktreePort) {
		throw new Error(
			`Refusing startup DB bootstrap for ${policy.host || "<missing-host>"}:${policy.port}. Expected the worktree-local database at ${policy.expectedDbHost}:${policy.expectedDbPort}, or set ALLOW_NON_LOCAL_STARTUP_DB_BOOTSTRAP=true in an environment that intentionally bootstraps a non-local database.`,
		);
	}

	const reachable = await probe({
		host: policy.host,
		port: policy.port,
	});

	if (!reachable) {
		throw new Error(
			`Refusing startup DB bootstrap because ${policy.host}:${policy.port} is not reachable. Run npm run worktree:bootstrap && npm run dev:stack:up, or set SKIP_STARTUP_MIGRATIONS=true for local non-DB tasks.`,
		);
	}

	return {
		mode: "worktree-local",
		...policy,
	};
}

module.exports = {
	buildStartupDbBootstrapPolicy,
	enforceStartupDbBootstrapGuard,
	isTruthyEnv,
	normalizeDbHost,
	probeTcpPort,
};
