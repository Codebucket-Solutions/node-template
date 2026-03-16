const { detectClaimOverlaps, formatOverlapReason, loadPlanClaims } = require("./plan-claims");

function parseArgs(argv) {
	return {
		strict: argv.includes("--strict"),
	};
}

function main() {
	const { strict } = parseArgs(process.argv.slice(2));
	const plans = loadPlanClaims({ root: process.cwd(), dirName: "active" });

	if (plans.length === 0) {
		console.log("No active plan claims to inspect.");
		return;
	}

	const overlaps = detectClaimOverlaps(plans);

	if (overlaps.length === 0) {
		console.log(`No overlapping active plan claims found across ${plans.length} plan(s).`);
		return;
	}

	console.warn(`Found ${overlaps.length} overlapping active plan claim pair(s):`);
	for (const overlap of overlaps) {
		console.warn(
			`- ${overlap.left.relativePath} <-> ${overlap.right.relativePath} (${formatOverlapReason(overlap)})`,
		);
	}
	console.warn("Narrow the scope or record a handoff in the plan before editing the same area.");

	if (strict) {
		process.exit(1);
	}
}

main();
