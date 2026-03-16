const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

function resolveEnvFileList(nodeEnv = process.env.NODE_ENV) {
	const env = nodeEnv || "development";

	return [`.env.${env}`, ".env.worktree", ".env.local"].map(file =>
		path.join(process.cwd(), file),
	);
}

function loadEnvironment(nodeEnv = process.env.NODE_ENV) {
	for (const filePath of resolveEnvFileList(nodeEnv)) {
		if (!fs.existsSync(filePath)) {
			continue;
		}

		dotenv.config({
			path: filePath,
			override: true,
		});
	}
}

module.exports = {
	loadEnvironment,
	resolveEnvFileList,
};
