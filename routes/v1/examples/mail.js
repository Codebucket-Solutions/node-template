const express = require("express");

const { apiLimiter, validateToken } = require("../../../middleware");
const { sendMailExample } = require("../../../controllers/v1/examples");

const router = express.Router();

router.post("/send", validateToken, apiLimiter, sendMailExample);

module.exports = router;
