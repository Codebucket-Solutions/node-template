const { ErrorHandler, statusCodes } = require("../../../helper");
const { sendMail } = require("../../../utils");

const { BAD_REQUEST, SERVER_ERROR } = statusCodes;
const DEFAULT_SUBJECT = "Template mail example";
const DEFAULT_HTML = "<p>This email was sent through the template mail utility.</p>";

const sendMailExampleService = async ({ body }) => {
	const recipient = String(body?.recipient || body?.to || "").trim();
	if (!recipient) {
		throw new ErrorHandler(BAD_REQUEST, "recipient is required");
	}

	const subject = String(body?.subject || DEFAULT_SUBJECT).trim();
	const html = String(body?.html || DEFAULT_HTML).trim();
	const attachments = Array.isArray(body?.attachments) ? body.attachments : [];

	const info = await sendMail(recipient, subject, html, attachments);
	if (!info || info === 0) {
		throw new ErrorHandler(SERVER_ERROR, "Unable to send email");
	}

	return {
		message: "Mail example completed",
		transport: String(process.env.EMAIL_TRANSPORT || "SMTP").toUpperCase(),
		recipient,
		subject,
		delivery: {
			messageId: info.messageId || null,
			accepted: info.accepted || [],
			rejected: info.rejected || [],
		},
	};
};

module.exports = {
	sendMailExampleService,
};
