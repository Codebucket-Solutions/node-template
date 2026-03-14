const express = require("express");

const upload = require("./upload");
const sms = require("./sms");
const mail = require("./mail");
const pdf = require("./pdf");
const pagination = require("./pagination");

const app = express();

app.use("/files", upload);
app.use("/sms", sms);
app.use("/mail", mail);
app.use("/pdf", pdf);
app.use("/pagination", pagination);

module.exports = {
	examples: app,
};
