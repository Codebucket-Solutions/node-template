const assert = require("assert");
const { containerCpuLimit, workerCount } = require("../config/cpu-count");

/** A stand-in for the cgroup files: path -> content; anything else doesn't exist. */
function files(map) {
	return file => {
		if (!(file in map)) {
			throw new Error(`ENOENT: ${file}`);
		}
		return map[file];
	};
}

describe("worker count", () => {
	it("uses the container's CPU limit (cgroup v2), rounded up", () => {
		assert.strictEqual(
			containerCpuLimit(files({ "/sys/fs/cgroup/cpu.max": "25000 100000\n" })),
			0.25,
		);
		assert.strictEqual(
			workerCount({ env: {}, read: files({ "/sys/fs/cgroup/cpu.max": "25000 100000" }) }),
			1,
		);
		assert.strictEqual(
			workerCount({ env: {}, read: files({ "/sys/fs/cgroup/cpu.max": "250000 100000" }) }),
			3,
		);
	});

	it("reads cgroup v1 when there is no v2", () => {
		const v1 = files({
			"/sys/fs/cgroup/cpu/cpu.cfs_quota_us": "200000",
			"/sys/fs/cgroup/cpu/cpu.cfs_period_us": "100000",
		});
		assert.strictEqual(workerCount({ env: {}, read: v1 }), 2);
	});

	it("falls back to one worker without a limit, never the host's CPU count", () => {
		assert.strictEqual(
			workerCount({ env: {}, read: files({ "/sys/fs/cgroup/cpu.max": "max 100000" }) }),
			1,
		);
		assert.strictEqual(
			workerCount({
				env: {},
				read: files({
					"/sys/fs/cgroup/cpu/cpu.cfs_quota_us": "-1",
					"/sys/fs/cgroup/cpu/cpu.cfs_period_us": "100000",
				}),
			}),
			1,
		);
		assert.strictEqual(workerCount({ env: {}, read: files({}) }), 1);
	});

	it("WEB_CONCURRENCY wins", () => {
		assert.strictEqual(
			workerCount({
				env: { WEB_CONCURRENCY: "4" },
				read: files({ "/sys/fs/cgroup/cpu.max": "25000 100000" }),
			}),
			4,
		);
	});
});
