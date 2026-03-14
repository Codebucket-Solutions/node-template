const { uploadExample } = require("./upload");
const { sendSmsExample } = require("./sms");
const { sendMailExample } = require("./mail");
const { renderPdfExample } = require("./pdf");
const { paginateOffsetExample, paginateCursorExample } = require("./pagination");

module.exports = {
	uploadExample,
	sendSmsExample,
	sendMailExample,
	renderPdfExample,
	paginateOffsetExample,
	paginateCursorExample,
};
