const express = require("express");
const router = express.Router();

const { dispatcher } = require("../../../middleware");
const { createApi } = require("../../../controllers/v1");

const { PERMS } = require("../../../utils/constant");

router.post("/", (req, res, next) =>
  dispatcher(req, res, next, createApi, PERMS.ADD)
);

module.exports = router;
