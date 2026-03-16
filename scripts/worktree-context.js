const path = require("path");

function hashString(input) {
	let hash = 0;

	for (const character of input) {
		hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
	}

	return hash;
}

function slugify(value) {
	return String(value || "")
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 24);
}

function getWorktreeContext(root = process.cwd()) {
	const worktreeName = path.basename(root);
	const worktreeSlug = slugify(worktreeName) || "workspace";
	const hash = hashString(root);
	const portOffset = 100 + (hash % 4000);
	const suffix = String(hash % 10000).padStart(4, "0");
	const composeProjectName = `node-template-${worktreeSlug}-${suffix}`;

	return {
		root,
		worktreeName,
		worktreeSlug,
		hash,
		portOffset,
		composeProjectName,
		appPort: 9000 + portOffset,
		dbPort: 3306 + portOffset,
		redisPort: 6379 + portOffset,
		grafanaPort: 3001 + portOffset,
		lokiPort: 3100 + portOffset,
		tempoPort: 3200 + portOffset,
		otlpGrpcPort: 4317 + portOffset,
		otlpHttpPort: 4318 + portOffset,
		prometheusPort: 9090 + portOffset,
		otelServiceName: `node-template-${worktreeSlug}-${suffix}`,
	};
}

module.exports = {
	getWorktreeContext,
	hashString,
	slugify,
};
