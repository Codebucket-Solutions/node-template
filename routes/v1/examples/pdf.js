const express = require("express");

const { apiLimiter, validateToken } = require("../../../middleware");
const { renderPdfExample } = require("../../../controllers/v1/examples");

const router = express.Router();

router.post("/render", validateToken, apiLimiter, renderPdfExample);

module.exports = router;
