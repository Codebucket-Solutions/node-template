const { ErrorHandler, statusCodes } = require("../helper");
const {
	createUploadStorage,
	createSingleUpload,
	createArrayUpload,
	handleMulterUpload,
} = require("../utils/upload");

const { BAD_REQUEST } = statusCodes;

function createUploadError(message) {
	return new ErrorHandler(BAD_REQUEST, message);
}

function createMimeTypeFilter({ allowedMimes, message }) {
	return (_req, file, cb) => {
		if (allowedMimes.includes(file.mimetype)) {
			return cb(null, true);
		}

		return cb(createUploadError(message), false);
	};
}

function createEnumFieldFilter({ fieldName, allowedValues, message }) {
	return (req, _file, cb) => {
		const fieldValue = req.body?.[fieldName] || req.query?.[fieldName];

		if (!fieldValue || !allowedValues.includes(fieldValue)) {
			return cb(
				createUploadError(
					message ||
						`${fieldName} is required and must be one of: ${allowedValues.join(", ")}`,
				),
				false,
			);
		}

		return cb(null, true);
	};
}

function createSingleUploadMiddleware({
	directory,
	fieldName = "file",
	fileFilter,
	limits,
	storage,
	fileSizeMessage,
	key,
}) {
	const resolvedStorage = storage || createUploadStorage({ directory, key });

	return handleMulterUpload(
		createSingleUpload({
			fieldName,
			storage: resolvedStorage,
			fileFilter,
			limits,
		}),
		{ fileSizeMessage },
	);
}

function createArrayUploadMiddleware({
	directory,
	fieldName = "files",
	maxCount = 10,
	fileFilter,
	limits,
	storage,
	fileSizeMessage,
	key,
}) {
	const resolvedStorage = storage || createUploadStorage({ directory, key });

	return handleMulterUpload(
		createArrayUpload({
			fieldName,
			maxCount,
			storage: resolvedStorage,
			fileFilter,
			limits,
		}),
		{ fileSizeMessage },
	);
}

function buildUploadMiddlewareMap(definitions) {
	return Object.entries(definitions).reduce((accumulator, [name, definition]) => {
		const storage = createUploadStorage({
			directory: definition.directory,
			key: definition.key,
		});
		const createUploadMiddleware =
			definition.mode === "array"
				? createArrayUploadMiddleware
				: createSingleUploadMiddleware;

		accumulator[`${name}Storage`] = storage;
		accumulator[`${name}Upload`] = createUploadMiddleware({
			...definition,
			storage,
		});

		return accumulator;
	}, {});
}

module.exports = {
	createUploadError,
	createMimeTypeFilter,
	createEnumFieldFilter,
	createSingleUploadMiddleware,
	createArrayUploadMiddleware,
	buildUploadMiddlewareMap,
};
