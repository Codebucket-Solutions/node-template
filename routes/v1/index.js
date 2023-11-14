const express = require("express");
const app = express();

const { general } = require("./general");

app.use("/", general);

module.exports = app;
