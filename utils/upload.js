const path = require("node:path");
const multer = require("multer");
const { Files, createMulterUploader } = require("@codebucket/files");
const { ErrorHandler, statusCodes } = require("../helper");
const { SUCCESS } = require("./constant");

const { BAD_REQUEST = 400 } = statusCodes;

let filesConfig;
if (process.env.UPLOAD_SERVER === "S3") {
	filesConfig = {
		type: "s3",
		publicBaseUrl: `${process.env.BASEURL}/files`,
		bucketName: process.env.S3_BUCKET_NAME,
		endpoint: process.env.S3_ENDPOINT,
		s3Config: {
			region: process.env.S3_REGION,
			credentials: {
				accessKeyId: process.env.S3_ACCESS_KEY_ID,
				secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
			},
		},
	};
} else {
	filesConfig = {
		type: "filesystem",
		publicBaseUrl: `${process.env.BASEURL}/files`,
		baseDir: "./public/uploads",
	};
}

const uploader = new Files(filesConfig);

function sanitizeFilename(filename) {
	const ext = path.extname(filename || "").toLowerCase();
	return `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
}

function getUploadPrefix() {
	return String(process.env.prefix || "uploads").replace(/^\/+|\/+$/g, "");
}

function buildUploadKey(directory, filename) {
	return `/${getUploadPrefix()}/${directory}/${sanitizeFilename(filename)}`;
}

function createUploadStorage(options = {}) {
	const { directory = "uploads", key } = options;

	return createMulterUploader(uploader, {
		key:
			key ||
			((req, file) => {
				return buildUploadKey(directory, file.originalname);
			}),
		keepBuffer: false,
	});
}

function createMulterUpload(options = {}) {
	const { storage, directory, fileFilter, limits } = options;
	const resolvedStorage = storage || createUploadStorage({ directory, key: options.key });

	return multer({
		storage: resolvedStorage,
		fileFilter,
		limits,
	});
}

function createSingleUpload(options = {}) {
	const { fieldName = "file", ...multerOptions } = options;
	return createMulterUpload(multerOptions).single(fieldName);
}

function createArrayUpload(options = {}) {
	const { fieldName = "files", maxCount = 10, ...multerOptions } = options;
	return createMulterUpload(multerOptions).array(fieldName, maxCount);
}

function handleMulterUpload(uploadFn, options = {}) {
	const { fileSizeMessage = "File size exceeds the allowed limit" } = options;

	return (req, res, next) => {
		uploadFn(req, res, err => {
			if (err instanceof multer.MulterError) {
				if (err.code === "LIMIT_FILE_SIZE") {
					return next(new ErrorHandler(BAD_REQUEST, fileSizeMessage));
				}

				return next(new ErrorHandler(BAD_REQUEST, err.message));
			}

			if (err) {
				return next(err);
			}

			return next();
		});
	};
}

function isUploadedFile(file) {
	return Boolean(
		file &&
			typeof file === "object" &&
			("originalname" in file || "fieldname" in file) &&
			("location" in file || "key" in file || "path" in file),
	);
}

function normalizeUploadedFiles(files, fieldName) {
	if (!files) {
		return [];
	}

	if (Array.isArray(files)) {
		return files.filter(Boolean);
	}

	if (fieldName && Array.isArray(files[fieldName])) {
		return files[fieldName].filter(Boolean);
	}

	if (fieldName && files[fieldName]) {
		return [files[fieldName]];
	}

	if (isUploadedFile(files)) {
		return [files];
	}

	return Object.values(files).flatMap(value => {
		if (Array.isArray(value)) {
			return value.filter(Boolean);
		}

		return value ? [value] : [];
	});
}

function formatUploadedFile(file) {
	const key = file.key || file.filename || null;
	const url = key ? uploader.getPublicUrl(key) : file.location || file.path || null;

	return {
		message: SUCCESS,
		url,
		location: file.location || file.path || null,
		name: path.posix.basename(key || file.originalname || "upload"),
		originalName: file.originalname || null,
		key,
		size: file.size,
		mimetype: file.mimetype,
		fieldname: file.fieldname,
	};
}

module.exports = {
	fileUpload: async (files, _body, fieldName) => {
		try {
			const uploadedFiles = normalizeUploadedFiles(files, fieldName);
			if (uploadedFiles.length === 0) {
				throw new Error("Missing uploaded file");
			}

			if (uploadedFiles.length === 1) {
				return formatUploadedFile(uploadedFiles[0]);
			}

			return {
				message: SUCCESS,
				files: uploadedFiles.map(formatUploadedFile),
			};
		} catch (error) {
			console.error(error);
			return 0;
		}
	},
	fileDownload: async (req, res) => {
		let fullPath = req.path;
		fullPath = fullPath.replace("/files", "");

		const normalized = path.posix.normalize(fullPath).replace(/\\/g, "/");

		if (
			normalized.includes("..") ||
			!normalized.startsWith("/") ||
			(normalized.length && normalized.includes("\0"))
		) {
			return res.status(400).json({ message: "Invalid file path" });
		}

		const safeName = path.posix.basename(normalized) || "download";
		const forcedDisposition = `attachment; filename="${safeName.replace(/[^a-zA-Z0-9._-]/g, "_")}"; filename*=UTF-8''${encodeURIComponent(safeName)}`;

		const originalSetHeader = res.setHeader.bind(res);
		res.setHeader = (name, value) => {
			if (String(name).toLowerCase() === "content-disposition") {
				return originalSetHeader("Content-Disposition", forcedDisposition);
			}
			return originalSetHeader(name, value);
		};

		const originalWriteHead = res.writeHead;
		res.writeHead = function patchedWriteHead(statusCode, statusMessage, headers) {
			try {
				let actualStatusMessage = statusMessage;
				let actualHeaders = headers;
				if (typeof actualStatusMessage === "object" && actualHeaders === undefined) {
					actualHeaders = actualStatusMessage;
					actualStatusMessage = undefined;
				}

				res.setHeader("X-Content-Type-Options", "nosniff");
				res.setHeader("Content-Disposition", forcedDisposition);
				res.setHeader("Referrer-Policy", "no-referrer");
				res.setHeader("Cross-Origin-Resource-Policy", "same-site");
				res.setHeader(
					"Content-Security-Policy",
					"default-src 'none'; sandbox; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; object-src 'none'",
				);
				res.setHeader("Cache-Control", "no-store, max-age=0");
				res.setHeader("Pragma", "no-cache");

				if (actualHeaders && typeof actualHeaders === "object") {
					actualHeaders["Content-Disposition"] = forcedDisposition;
					actualHeaders["X-Content-Type-Options"] = "nosniff";
				}

				return actualStatusMessage !== undefined
					? originalWriteHead.call(this, statusCode, actualStatusMessage, actualHeaders)
					: originalWriteHead.call(this, statusCode, actualHeaders);
			} catch {
				return originalWriteHead.apply(this, arguments);
			}
		};

		if (!res.headersSent) {
			res.setHeader("X-Content-Type-Options", "nosniff");
			res.setHeader("Content-Disposition", forcedDisposition);
			res.setHeader("Referrer-Policy", "no-referrer");
			res.setHeader("Cross-Origin-Resource-Policy", "same-site");
			res.setHeader(
				"Content-Security-Policy",
				"default-src 'none'; sandbox; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; object-src 'none'",
			);
			res.setHeader("Cache-Control", "no-store, max-age=0");
			res.setHeader("Pragma", "no-cache");
		}

		try {
			console.log("[fileDownload]", { normalized });
			await uploader.download(normalized, res);

			if (!res.headersSent) {
				process.nextTick(() => {
					try {
						if (!res.headersSent) {
							res.setHeader("Content-Disposition", forcedDisposition);
						}
					} catch {
						// ignore
					}
				});
			}
		} catch (err) {
			console.error("[fileDownload] download failed", {
				normalized,
				err: err?.message || err,
			});

			if (res.headersSent) {
				try {
					res.end();
				} catch {
					// ignore
				}
				return;
			}

			const msg = String(err?.message || "");
			const isNotFound = /not\s*found|no\s*such|404|key/i.test(msg);
			return res.status(isNotFound ? 404 : 502).json({
				message: isNotFound ? "File not found" : "Unable to download file",
			});
		} finally {
			res.setHeader = originalSetHeader;
			res.writeHead = originalWriteHead;
		}
	},
	uploader,
	fileStorage: uploader,
	sanitizeFilename,
	buildUploadKey,
	createUploadStorage,
	createMulterUpload,
	createSingleUpload,
	createArrayUpload,
	handleMulterUpload,
	uploadMiddleware: createMulterUpload(),
};
