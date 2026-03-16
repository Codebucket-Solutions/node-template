const assert = require("assert");

const {
	buildStartupDbBootstrapPolicy,
	enforceStartupDbBootstrapGuard,
} = require("../config/startup-db-guard");

describe("startup DB bootstrap guard", () => {
	it("allows the expected local worktree DB when it is reachable", async () => {
		const decision = await enforceStartupDbBootstrapGuard({
			env: {
				DB_HOST: "127.0.0.1",
				DB_PORT: "4401",
			},
			worktreeContext: {
				dbPort: 4401,
				composeProjectName: "node-template-worktree",
				worktreeName: "wt-guard",
			},
			probe: async () => true,
		});

		assert.strictEqual(decision.mode, "worktree-local");
		assert.strictEqual(decision.expectedDbPort, 4401);
	});

	it("rejects non-local DB targets unless the override env is set", async () => {
		await assert.rejects(
			enforceStartupDbBootstrapGuard({
				env: {
					DB_HOST: "db.internal",
					DB_PORT: "3306",
				},
				worktreeContext: {
					dbPort: 4401,
					composeProjectName: "node-template-worktree",
					worktreeName: "wt-guard",
				},
				probe: async () => true,
			}),
			/ALLOW_NON_LOCAL_STARTUP_DB_BOOTSTRAP=true/,
		);
	});

	it("allows explicit non-local deployment bootstrap override", async () => {
		const policy = buildStartupDbBootstrapPolicy({
			env: {
				DB_HOST: "db.internal",
				DB_PORT: "3306",
				ALLOW_NON_LOCAL_STARTUP_DB_BOOTSTRAP: "true",
			},
			worktreeContext: {
				dbPort: 4401,
				composeProjectName: "node-template-worktree",
				worktreeName: "wt-guard",
			},
		});

		assert.strictEqual(policy.overrideEnabled, true);

		const decision = await enforceStartupDbBootstrapGuard({
			env: {
				DB_HOST: "db.internal",
				DB_PORT: "3306",
				ALLOW_NON_LOCAL_STARTUP_DB_BOOTSTRAP: "true",
			},
			worktreeContext: {
				dbPort: 4401,
				composeProjectName: "node-template-worktree",
				worktreeName: "wt-guard",
			},
			probe: async () => false,
		});

		assert.strictEqual(decision.mode, "override");
	});
});
