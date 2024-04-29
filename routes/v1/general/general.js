const express = require("express");
const router = express.Router();

const { dispatcher } = require("@middleware");
const { createApi } = require("@controllers/v1");

const { constant } = require("@utils");
const { PERMS, RESOURCES } = constant

router.post("/", (req, res, next) =>
  dispatcher(req, res, next, createApi, RESOURCES.TEMP, PERMS.ADD)
);

module.exports = router;
