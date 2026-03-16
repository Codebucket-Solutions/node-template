const assert = require("assert");

const {
	comparePlanClaims,
	detectClaimOverlaps,
	formatOverlapReason,
} = require("../scripts/plan-claims");

describe("plan claim overlap detection", () => {
	it("detects overlaps when plans share multiple meaningful scope tokens", () => {
		const overlaps = detectClaimOverlaps([
			{
				status: "active",
				claimStatus: "claimed",
				relativePath: "docs/exec-plans/active/a.md",
				normalizedFragments: ["guard startup db bootstrap against unintended targets"],
				tokens: ["guard", "startup", "bootstrap", "targets"],
			},
			{
				status: "active",
				claimStatus: "claimed",
				relativePath: "docs/exec-plans/active/b.md",
				normalizedFragments: ["startup db bootstrap reliability guard"],
				tokens: ["startup", "bootstrap", "reliability", "guard"],
			},
		]);

		assert.strictEqual(overlaps.length, 1);
		assert.match(formatOverlapReason(overlaps[0]), /shared scope tokens/);
	});

	it("detects overlaps when one scope nests the same path", () => {
		const comparison = comparePlanClaims(
			{
				normalizedFragments: ["docs/workflow.md", "init.js"],
				tokens: ["docs", "workflow", "init"],
			},
			{
				normalizedFragments: ["docs/workflow.md#plan-lifecycle"],
				tokens: ["docs", "workflow", "plan", "lifecycle"],
			},
		);

		assert.strictEqual(comparison.overlaps, true);
		assert.deepStrictEqual(comparison.nestedMatches, ["docs/workflow.md"]);
	});

	it("ignores completed or released plans", () => {
		const overlaps = detectClaimOverlaps([
			{
				status: "completed",
				claimStatus: "released",
				relativePath: "docs/exec-plans/completed/a.md",
				normalizedFragments: ["docs/workflow.md"],
				tokens: ["docs", "workflow"],
			},
			{
				status: "active",
				claimStatus: "released",
				relativePath: "docs/exec-plans/active/b.md",
				normalizedFragments: ["docs/workflow.md"],
				tokens: ["docs", "workflow"],
			},
			{
				status: "active",
				claimStatus: "claimed",
				relativePath: "docs/exec-plans/active/c.md",
				normalizedFragments: ["docs/workflow.md"],
				tokens: ["docs", "workflow"],
			},
		]);

		assert.strictEqual(overlaps.length, 0);
	});
});
