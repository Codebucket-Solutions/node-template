const fs = require("fs");
const path = require("path");

const root = process.cwd();

function countFiles(dir) {
	const target = path.join(root, dir);
	if (!fs.existsSync(target)) {
		return 0;
	}

	return fs.readdirSync(target, { withFileTypes: true }).filter(entry => entry.isFile()).length;
}

function countMatchingFiles(dir, predicate) {
	const target = path.join(root, dir);
	if (!fs.existsSync(target)) {
		return 0;
	}

	return fs
		.readdirSync(target, { withFileTypes: true })
		.filter(entry => entry.isFile() && predicate(entry.name)).length;
}

function countMarkdownFiles(dir) {
	const target = path.join(root, dir);
	if (!fs.existsSync(target)) {
		return 0;
	}

	return fs
		.readdirSync(target, { withFileTypes: true })
		.filter(entry => entry.isFile() && entry.name.endsWith(".md")).length;
}

const payload = {
	generatedAt: new Date().toISOString(),
	runtimeLayers: {
		bin: countFiles("bin"),
		config: countFiles("config"),
		migrations: countMatchingFiles("migrations", name => name.endsWith(".js")),
		routes: countFiles("routes/v1"),
		controllers: countFiles("controllers/v1"),
		service: countFiles("service/v1"),
		middleware: countFiles("middleware"),
		models: countFiles("models"),
		utils: countFiles("utils"),
	},
	harness: {
		hasAgents: fs.existsSync(path.join(root, "AGENTS.md")),
		hasCodexConfig: fs.existsSync(path.join(root, ".codex", "config.toml")),
		hasCiWorkflow: fs.existsSync(path.join(root, ".github", "workflows", "ci.yml")),
		hasDevStack: fs.existsSync(path.join(root, "docker-compose.dev.yml")),
		hasSmokeScript: fs.existsSync(path.join(root, "scripts", "smoke-server.js")),
		hasObservabilityQueryScript: fs.existsSync(
			path.join(root, "scripts", "query-observability.js"),
		),
	},
	documentation: {
		rootDocs: countMarkdownFiles("docs"),
		designDocs: countMarkdownFiles("docs/design-docs"),
		productSpecs: countMarkdownFiles("docs/product-specs"),
		activePlans: countMarkdownFiles("docs/exec-plans/active"),
		completedPlans: countMarkdownFiles("docs/exec-plans/completed"),
	},
};

const outDir = path.join(root, "docs", "references");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
	path.join(outDir, "architecture-inventory.json"),
	`${JSON.stringify(payload, null, "\t")}\n`,
);

console.log("Architecture inventory generated.");
