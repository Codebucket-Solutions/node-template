const express = require("express");
const app = express();

const General = require("./general");

app.use("/", General);

module.exports = app;
