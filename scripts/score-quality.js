const fs = require("fs");
const path = require("path");

const checks = [
	["AGENTS.md", fs.existsSync("AGENTS.md")],
	["docs/ARCHITECTURE.md", fs.existsSync("docs/ARCHITECTURE.md")],
	["docs/WORKFLOW.md", fs.existsSync("docs/WORKFLOW.md")],
	["docs/QUALITY.md", fs.existsSync("docs/QUALITY.md")],
	["docs/SECURITY.md", fs.existsSync("docs/SECURITY.md")],
	["docs/RELIABILITY.md", fs.existsSync("docs/RELIABILITY.md")],
	[".codex/config.toml", fs.existsSync(".codex/config.toml")],
	["scripts/worktree-bootstrap.sh", fs.existsSync("scripts/worktree-bootstrap.sh")],
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
fs.writeFileSync(path.join(outDir, "quality-score.json"), JSON.stringify(payload, null, 2));
console.log(`Quality score generated: ${score}`);
