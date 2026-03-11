const fs = require("fs");
const path = require("path");
const { Files } = require("@codebucket/files");
const { SUCCESS } = require("./constant");

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

const fileStorage = new Files(filesConfig);

module.exports = {
	fileUpload: async (files, body, _key) => {
		let filePath;
		try {
			filePath = files?.path;
			const fileName =
				new Date()
					.toISOString()
					.replace(/:/g, "-")
					.replace(/[^a-z0-9]/gi, "_")
					.toLowerCase() + path.extname(files.originalname);

			await fileStorage.upload(
				`/${process.env.prefix}/${body.userId}/${fileName}`,
				fs.readFileSync(files.path),
			);

			const url = fileStorage.getPublicUrl(
				`/${process.env.prefix}/${body.userId}/${fileName}`,
			);

			return {
				message: SUCCESS,
				url,
				name: fileName,
			};
		} catch (error) {
			console.error(error);
		} finally {
			if (filePath) {
				fs.promises.unlink(filePath).catch(() => {
					// ignore cleanup errors
				});
			}
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
			await fileStorage.download(normalized, res);

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
};
