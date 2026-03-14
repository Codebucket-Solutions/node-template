const express = require("express");

const { apiLimiter, validateToken } = require("../../../middleware");
const { sendSmsExample } = require("../../../controllers/v1/examples");

const router = express.Router();

router.post("/send", validateToken, apiLimiter, sendSmsExample);

module.exports = router;
