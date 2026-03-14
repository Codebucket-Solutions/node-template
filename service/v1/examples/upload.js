const { ErrorHandler, statusCodes } = require("../../../helper");
const { fileUpload } = require("../../../utils");

const { BAD_REQUEST, SERVER_ERROR } = statusCodes;

const uploadExampleService = async ({ file, body }) => {
	if (!file) {
		throw new ErrorHandler(BAD_REQUEST, "file is required");
	}

	const uploadedFile = await fileUpload(file, body, "file");
	if (!uploadedFile || uploadedFile === 0) {
		throw new ErrorHandler(SERVER_ERROR, "Unable to process uploaded file");
	}

	return {
		message: "Upload example completed",
		type: body?.type || null,
		file: uploadedFile,
	};
};

module.exports = {
	uploadExampleService,
};
