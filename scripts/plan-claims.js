const fs = require("fs");
const path = require("path");

const STOP_WORDS = new Set([
	"a",
	"an",
	"and",
	"for",
	"from",
	"in",
	"into",
	"of",
	"on",
	"or",
	"the",
	"to",
	"update",
	"use",
	"with",
]);

function normalizeWhitespace(value) {
	return String(value || "")
		.toLowerCase()
		.replace(/\s+/g, " ")
		.trim();
}

function normalizeFragment(value) {
	return normalizeWhitespace(value).replace(/[^a-z0-9/._ -]+/g, "");
}

function tokenizeFragment(value) {
	return normalizeFragment(value)
		.split(/[\s/._-]+/)
		.map(token => token.trim())
		.filter(token => token.length >= 3 && !STOP_WORDS.has(token));
}

function parsePlanMetadata(content) {
	const metadata = {};

	for (const line of content.split(/\r?\n/)) {
		const match = line.match(/^- ([^:]+):\s*(.*)$/);
		if (!match) {
			continue;
		}

		metadata[match[1].trim()] = match[2].trim();
	}

	return metadata;
}

function splitClaimScope(scope) {
	return String(scope || "")
		.split(/[|,;]+/)
		.map(fragment => fragment.trim())
		.filter(Boolean);
}

function readPlanClaim(fullPath, root = process.cwd()) {
	const content = fs.readFileSync(fullPath, "utf8");
	const metadata = parsePlanMetadata(content);
	const fragments = splitClaimScope(metadata["Claim Scope"]);
	const normalizedFragments = fragments.map(normalizeFragment).filter(Boolean);

	return {
		filePath: fullPath,
		relativePath: path.relative(root, fullPath),
		title: content.match(/^# Execution Plan:\s*(.+)$/m)?.[1]?.trim() || path.basename(fullPath),
		status: metadata.Status || "",
		owner: metadata.Owner || "",
		claimScope: metadata["Claim Scope"] || "",
		claimStatus: metadata["Claim Status"] || "",
		claimWorktree: metadata["Claim Worktree"] || "",
		claimBranch: metadata["Claim Branch"] || "",
		claimUpdatedAt: metadata["Claim Updated At"] || "",
		fragments,
		normalizedFragments,
		tokens: Array.from(new Set(fragments.flatMap(tokenizeFragment))),
	};
}

function loadPlanClaims({ root = process.cwd(), dirName = "active" } = {}) {
	const dir = path.join(root, "docs", "exec-plans", dirName);
	if (!fs.existsSync(dir)) {
		return [];
	}

	return fs
		.readdirSync(dir)
		.filter(entry => entry.endsWith(".md"))
		.sort()
		.map(entry => readPlanClaim(path.join(dir, entry), root));
}

function findSharedTokens(left, right) {
	const rightTokens = new Set(right);
	return left.filter(token => rightTokens.has(token));
}

function findExactFragmentMatches(left, right) {
	const rightFragments = new Set(right);
	return left.filter(fragment => fragment.length >= 6 && rightFragments.has(fragment));
}

function findNestedPathMatches(left, right) {
	const matches = [];

	for (const leftFragment of left) {
		if (!leftFragment.includes("/") && !leftFragment.includes(".")) {
			continue;
		}

		for (const rightFragment of right) {
			if (leftFragment === rightFragment) {
				continue;
			}

			const shorter =
				leftFragment.length <= rightFragment.length ? leftFragment : rightFragment;
			const longer = shorter === leftFragment ? rightFragment : leftFragment;

			if (shorter.length >= 6 && longer.includes(shorter)) {
				matches.push(shorter);
			}
		}
	}

	return Array.from(new Set(matches));
}

function comparePlanClaims(left, right) {
	const exactMatches = findExactFragmentMatches(
		left.normalizedFragments,
		right.normalizedFragments,
	);
	const nestedMatches = findNestedPathMatches(
		left.normalizedFragments,
		right.normalizedFragments,
	);
	const sharedTokens = findSharedTokens(left.tokens, right.tokens);
	const significantSharedTokens = sharedTokens.filter(token => token.length >= 5);

	const overlaps =
		exactMatches.length > 0 ||
		nestedMatches.length > 0 ||
		significantSharedTokens.length >= 2 ||
		(sharedTokens.length >= 3 && left.tokens.length > 0 && right.tokens.length > 0);

	return {
		overlaps,
		exactMatches,
		nestedMatches,
		sharedTokens,
	};
}

function detectClaimOverlaps(plans) {
	const relevantPlans = plans.filter(
		plan => plan.status === "active" && plan.claimStatus.toLowerCase() !== "released",
	);
	const overlaps = [];

	for (let index = 0; index < relevantPlans.length; index += 1) {
		for (let nextIndex = index + 1; nextIndex < relevantPlans.length; nextIndex += 1) {
			const left = relevantPlans[index];
			const right = relevantPlans[nextIndex];
			const comparison = comparePlanClaims(left, right);

			if (!comparison.overlaps) {
				continue;
			}

			overlaps.push({
				left,
				right,
				...comparison,
			});
		}
	}

	return overlaps;
}

function formatOverlapReason(overlap) {
	if (overlap.exactMatches.length > 0) {
		return `exact scope match: ${overlap.exactMatches.join(", ")}`;
	}

	if (overlap.nestedMatches.length > 0) {
		return `nested path overlap: ${overlap.nestedMatches.join(", ")}`;
	}

	if (overlap.sharedTokens.length > 0) {
		return `shared scope tokens: ${overlap.sharedTokens.join(", ")}`;
	}

	return "overlapping claim scope";
}

module.exports = {
	comparePlanClaims,
	detectClaimOverlaps,
	formatOverlapReason,
	loadPlanClaims,
	normalizeFragment,
	parsePlanMetadata,
	readPlanClaim,
	splitClaimScope,
	tokenizeFragment,
};
