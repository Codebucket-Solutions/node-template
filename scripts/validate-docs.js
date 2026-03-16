const fs = require("fs");
const path = require("path");

const root = process.cwd();
const requiredFiles = [
	"AGENTS.md",
	"docs/ARCHITECTURE.md",
	"docs/MIGRATIONS.md",
	"docs/OBSERVABILITY.md",
	"docs/WORKFLOW.md",
	"docs/QUALITY.md",
	"docs/SECURITY.md",
	"docs/RELIABILITY.md",
	"docs/design-docs/index.md",
	"docs/product-specs/index.md",
	"docs/exec-plans/tech-debt-tracker.md",
	"migrations/README.md",
	"docs/references/architecture-inventory.json",
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

const completedPlansDir = path.join(root, "docs", "exec-plans", "completed");
if (!fs.existsSync(completedPlansDir)) {
	console.error("Missing completed plans directory: docs/exec-plans/completed");
	failed = true;
}

function validatePlanStatuses(dirName, expectedStatus) {
	const dir = path.join(root, "docs", "exec-plans", dirName);
	if (!fs.existsSync(dir)) {
		return;
	}

	for (const entry of fs.readdirSync(dir)) {
		if (!entry.endsWith(".md")) {
			continue;
		}

		const fullPath = path.join(dir, entry);
		const content = fs.readFileSync(fullPath, "utf8");
		if (!content.includes(`- Status: ${expectedStatus}`)) {
			console.error(
				`Plan file ${path.relative(root, fullPath)} must contain "- Status: ${expectedStatus}"`,
			);
			failed = true;
		}

		const requiredMarkers = [
			"- Owner:",
			"- Claim Scope:",
			"- Claim Worktree:",
			"- Claim Branch:",
			"- Claim Status:",
			"- Claim Updated At:",
			"## Goal",
			"## Acceptance criteria",
			"## Coordination notes",
			"## Checklist",
			"## Verification notes",
		];

		for (const marker of requiredMarkers) {
			if (!content.includes(marker)) {
				console.error(
					`Plan file ${path.relative(root, fullPath)} must contain "${marker}"`,
				);
				failed = true;
			}
		}
	}
}

validatePlanStatuses("active", "active");
validatePlanStatuses("completed", "completed");

if (failed) {
	process.exit(1);
}

console.log("Documentation validation passed.");
