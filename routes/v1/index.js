const express = require("express");
const app = express();

const { general } = require("./general");
const { examples } = require("./examples");

app.use("/", general);
app.use("/examples", examples);

module.exports = app;
