const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { detectClaimOverlaps, formatOverlapReason, loadPlanClaims } = require("./plan-claims");

function getArg(name) {
	const prefix = `--${name}=`;
	const arg = process.argv.find(item => item.startsWith(prefix));
	return arg ? arg.slice(prefix.length) : "";
}

function getCurrentBranch() {
	try {
		return execSync("git branch --show-current", {
			cwd: process.cwd(),
			stdio: ["ignore", "pipe", "ignore"],
		})
			.toString("utf8")
			.trim();
	} catch {
		return "unknown";
	}
}

const slug = getArg("slug").trim();
const title = getArg("title").trim();
const claimOwner = (getArg("owner").trim() || process.env.USER || "unassigned").trim();
const claimWorktree = path.basename(process.cwd());
const claimBranch = getCurrentBranch() || "unknown";

if (!slug || !title) {
	console.error('Usage: npm run plan:new -- --slug=my-task --title="My Task"');
	process.exit(1);
}

const target = path.join(process.cwd(), "docs", "exec-plans", "active", `${slug}.md`);
fs.mkdirSync(path.dirname(target), { recursive: true });
if (fs.existsSync(target)) {
	console.error(`Plan already exists: ${target}`);
	process.exit(1);
}

const content = `# Execution Plan: ${slug}

- Status: active
- Owner: ${claimOwner}
- Claim Scope: ${title}
- Claim Worktree: ${claimWorktree}
- Claim Branch: ${claimBranch}
- Claim Status: claimed
- Claim Updated At: ${new Date().toISOString()}
- Scope: ${title}

## Goal

Describe the intended result.

## Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2

## Coordination notes

- Adjacent active plans:
- Handoff or blocking notes:

## Checklist

- [ ] Inspect existing implementation
- [ ] Implement smallest useful change
- [ ] Update docs if needed
- [ ] Run verification

## Verification notes

- Pending
`;

fs.writeFileSync(target, content);
console.log(`Created ${path.relative(process.cwd(), target)}`);

const overlaps = detectClaimOverlaps(
	loadPlanClaims({
		root: process.cwd(),
		dirName: "active",
	}),
).filter(overlap => overlap.left.filePath === target || overlap.right.filePath === target);

if (overlaps.length === 0) {
	console.log("No overlapping active plan claims found for the new plan.");
} else {
	console.warn("The new plan overlaps existing active claim(s):");
	for (const overlap of overlaps) {
		const otherPlan =
			overlap.left.filePath === target
				? overlap.right.relativePath
				: overlap.left.relativePath;
		console.warn(`- ${otherPlan} (${formatOverlapReason(overlap)})`);
	}
	console.warn("Narrow the scope or record a handoff before editing the same area.");
}
