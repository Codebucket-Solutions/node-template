const express = require("express");

const { validateToken, uploadLimiter } = require("../../../middleware");
const { uploadExample } = require("../../../controllers/v1/examples");
const {
	createMimeTypeFilter,
	createSingleUploadMiddleware,
} = require("../../../middleware/multer");

const router = express.Router();
const exampleUploadMiddleware = createSingleUploadMiddleware({
	directory: "example-uploads",
	fieldName: "file",
	fileFilter: createMimeTypeFilter({
		allowedMimes: ["image/jpeg", "image/png", "application/pdf"],
		message: "Only JPEG, PNG, and PDF files are allowed",
	}),
	limits: {
		fileSize: 10 * 1024 * 1024,
	},
});

router.post("/upload", validateToken, uploadLimiter, exampleUploadMiddleware, uploadExample);

module.exports = router;
