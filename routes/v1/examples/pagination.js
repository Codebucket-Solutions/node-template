const express = require("express");

const { apiLimiter, validateToken } = require("../../../middleware");
const {
	paginateOffsetExample,
	paginateCursorExample,
} = require("../../../controllers/v1/examples");

const router = express.Router();

router.get("/offset", validateToken, apiLimiter, paginateOffsetExample);
router.get("/cursor", validateToken, apiLimiter, paginateCursorExample);

module.exports = router;
