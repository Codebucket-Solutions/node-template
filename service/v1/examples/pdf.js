const fs = require("node:fs");
const path = require("node:path");
const { ErrorHandler, statusCodes } = require("../../../helper");
const { renderPdf, sanitizeFilename } = require("../../../utils");

const { BAD_REQUEST, SERVER_ERROR } = statusCodes;
const EXAMPLE_PDF_DIR = path.join(process.cwd(), "tmp", "example-pdfs");
const DEFAULT_PDF_CONTENT = `<!doctype html>
<html>
	<head>
		<meta charset="utf-8" />
		<title>Template PDF Example</title>
	</head>
	<body>
		<h1>Template PDF Example</h1>
		<p>This PDF was rendered through @codebucket/puppet-master.</p>
	</body>
</html>`;

function buildExamplePdfPath(filename) {
	return path.join(EXAMPLE_PDF_DIR, sanitizeFilename(filename || "example.pdf"));
}

function normalizePdfOptions(value) {
	return value && typeof value === "object" && !Array.isArray(value) ? value : undefined;
}

const renderPdfExampleService = async ({ body }) => {
	const content = String(body?.content || body?.html || DEFAULT_PDF_CONTENT).trim();
	if (!content) {
		throw new ErrorHandler(BAD_REQUEST, "content is required");
	}

	const pdfPath = buildExamplePdfPath(body?.filename || "example.pdf");

	try {
		await renderPdf({
			content,
			pdfPath,
			pageOptions: normalizePdfOptions(body?.pageOptions),
			pdfOptions: normalizePdfOptions(body?.pdfOptions),
			launchOptions: normalizePdfOptions(body?.launchOptions),
			otherPageFunctions: Array.isArray(body?.otherPageFunctions)
				? body.otherPageFunctions
				: undefined,
		});
	} catch (error) {
		throw new ErrorHandler(SERVER_ERROR, error.message || "Unable to render PDF");
	}

	const fileStats = await fs.promises.stat(pdfPath);

	return {
		message: "PDF example completed",
		pdfPath,
		relativePath: path.relative(process.cwd(), pdfPath),
		size: fileStats.size,
	};
};

module.exports = {
	renderPdfExampleService,
};
