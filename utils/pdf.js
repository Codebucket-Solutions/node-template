const fs = require("fs");
const path = require("path");
const { PuppetMaster } = require("@codebucket/puppet-master");

let puppetMaster = null;

function getRequiredEnv(name) {
	const value = process.env[name];
	if (!value) {
		throw new Error(`Missing required environment variable: ${name}`);
	}

	return value;
}

function getPuppetMasterClient() {
	if (!puppetMaster) {
		puppetMaster = new PuppetMaster({
			baseUrl: getRequiredEnv("PUPPET_MASTER_BASE_URL"),
			apiKey: getRequiredEnv("PUPPET_MASTER_API_KEY"),
		});
	}

	return puppetMaster;
}

module.exports = {
	// Keep PDF rendering behind the published client instead of adding a local Puppeteer stack.
	renderPdf: async ({
		content,
		pdfPath,
		pageOptions,
		pdfOptions,
		otherPageFunctions,
		launchOptions,
	}) => {
		if (!content) {
			throw new Error("renderPdf requires HTML content");
		}

		if (!pdfPath) {
			throw new Error("renderPdf requires an output pdfPath");
		}

		await fs.promises.mkdir(path.dirname(pdfPath), { recursive: true });
		await getPuppetMasterClient().pdf({
			content,
			pdfPath,
			pageOptions,
			pdfOptions,
			otherPageFunctions,
			launchOptions,
		});

		return pdfPath;
	},
};
