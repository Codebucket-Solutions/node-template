const fs = require("fs");
const os = require("os");

// cgroup v2 and v1 files holding the container's CPU limit (quota per period)
const CGROUP_V2_CPU_MAX = "/sys/fs/cgroup/cpu.max";
const CGROUP_V1_QUOTA = "/sys/fs/cgroup/cpu/cpu.cfs_quota_us";
const CGROUP_V1_PERIOD = "/sys/fs/cgroup/cpu/cpu.cfs_period_us";

function readFile(file, read) {
	try {
		return read(file).trim();
	} catch {
		return null;
	}
}

/**
 * The container's CPU limit in CPUs (e.g. 0.25 for "250m"), or null when there is none or it can't be read.
 * os.cpus() reports the host's CPUs, not what the container may use.
 */
function containerCpuLimit(read = file => fs.readFileSync(file, "utf8")) {
	const v2 = readFile(CGROUP_V2_CPU_MAX, read);
	if (v2) {
		const [quota, period] = v2.split(/\s+/);
		if (quota !== "max" && Number(quota) > 0 && Number(period) > 0) {
			return Number(quota) / Number(period);
		}
		return null;
	}
	const quota = Number(readFile(CGROUP_V1_QUOTA, read));
	const period = Number(readFile(CGROUP_V1_PERIOD, read));
	if (quota > 0 && period > 0) {
		return quota / period;
	}
	return null;
}

/**
 * How many workers to fork: WEB_CONCURRENCY when set; else the container's CPU limit rounded up (at least 1); else 1.
 * Never the host's CPU count: in a container without a limit that is the whole node's, and every worker holds its own
 * memory and database pool.
 */
function workerCount({ env = process.env, read } = {}) {
	const configured = Number.parseInt(env.WEB_CONCURRENCY, 10);
	if (configured > 0) {
		return configured;
	}
	const limit = containerCpuLimit(read);
	if (limit) {
		return Math.max(1, Math.ceil(limit));
	}
	return 1;
}

module.exports = { containerCpuLimit, workerCount, hostCpus: () => os.cpus().length };
