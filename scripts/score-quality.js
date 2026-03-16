const fs = require("fs");
const path = require("path");

const checks = [
	["AGENTS.md", fs.existsSync("AGENTS.md")],
	["docs/ARCHITECTURE.md", fs.existsSync("docs/ARCHITECTURE.md")],
	["docs/MIGRATIONS.md", fs.existsSync("docs/MIGRATIONS.md")],
	["docs/OBSERVABILITY.md", fs.existsSync("docs/OBSERVABILITY.md")],
	["docs/WORKFLOW.md", fs.existsSync("docs/WORKFLOW.md")],
	["docs/QUALITY.md", fs.existsSync("docs/QUALITY.md")],
	["docs/SECURITY.md", fs.existsSync("docs/SECURITY.md")],
	["docs/RELIABILITY.md", fs.existsSync("docs/RELIABILITY.md")],
	["docs/design-docs/index.md", fs.existsSync("docs/design-docs/index.md")],
	["docs/product-specs/index.md", fs.existsSync("docs/product-specs/index.md")],
	["docs/exec-plans/tech-debt-tracker.md", fs.existsSync("docs/exec-plans/tech-debt-tracker.md")],
	["migrations/README.md", fs.existsSync("migrations/README.md")],
	[
		"docs/references/architecture-inventory.json",
		fs.existsSync("docs/references/architecture-inventory.json"),
	],
	[".codex/config.toml", fs.existsSync(".codex/config.toml")],
	["scripts/worktree-bootstrap.sh", fs.existsSync("scripts/worktree-bootstrap.sh")],
	["scripts/smoke-server.js", fs.existsSync("scripts/smoke-server.js")],
	["scripts/run-migrations.js", fs.existsSync("scripts/run-migrations.js")],
	["scripts/new-migration.js", fs.existsSync("scripts/new-migration.js")],
	["scripts/query-observability.js", fs.existsSync("scripts/query-observability.js")],
	["test/health.test.js", fs.existsSync("test/health.test.js")],
	["docker-compose.dev.yml", fs.existsSync("docker-compose.dev.yml")],
	["CI workflow", fs.existsSync(".github/workflows/ci.yml")],
];

const passed = checks.filter(([, ok]) => ok).length;
const total = checks.length;
const score = Math.round((passed / total) * 100);

const payload = {
	generatedAt: new Date().toISOString(),
	score,
	passed,
	total,
	checks: checks.map(([name, ok]) => ({ name, ok })),
};

const outDir = path.join(process.cwd(), "docs", "references");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
	path.join(outDir, "quality-score.json"),
	`${JSON.stringify(payload, null, "\t")}\n`,
);
console.log(`Quality score generated: ${score}`);
