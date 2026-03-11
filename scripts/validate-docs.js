const fs = require("fs");
const path = require("path");

const root = process.cwd();
const requiredFiles = [
	"AGENTS.md",
	"docs/ARCHITECTURE.md",
	"docs/WORKFLOW.md",
	"docs/QUALITY.md",
	"docs/SECURITY.md",
	"docs/RELIABILITY.md",
	".codex/config.toml",
];

let failed = false;
for (const rel of requiredFiles) {
	const full = path.join(root, rel);
	if (!fs.existsSync(full)) {
		console.error(`Missing required repo guidance file: ${rel}`);
		failed = true;
	}
}

const activePlansDir = path.join(root, "docs", "exec-plans", "active");
if (!fs.existsSync(activePlansDir)) {
	console.error("Missing active plans directory: docs/exec-plans/active");
	failed = true;
}

if (failed) {
	process.exit(1);
}

console.log("Documentation validation passed.");
