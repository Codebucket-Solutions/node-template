const nodemailer = require("nodemailer");
const { createTransport } = require("@codebucket/mail-transport");

let transporter = null;

function getMailTransportType() {
	return String(process.env.EMAIL_TRANSPORT || "SMTP")
		.trim()
		.toUpperCase();
}

function getMailTransporter() {
	if (transporter) {
		return transporter;
	}

	if (getMailTransportType() === "SMTP") {
		transporter = nodemailer.createTransport({
			host: process.env.EMAIL_HOST,
			port: Number(process.env.EMAIL_PORT || 465),
			secure: false,
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASSWORD,
			},
		});

		return transporter;
	}

	transporter = nodemailer.createTransport(
		createTransport({
			url: process.env.MAILSERVER_URL,
			senderId: process.env.MAILSERVER_SENDERID,
			accessToken: process.env.MAILSERVER_ACCESS_TOKEN || process.env.MAILSERVER_ACCESSTOKEN,
		}),
	);

	return transporter;
}

module.exports = {
	sendMail: async (recipient, subject, body, attachments = []) => {
		try {
			const options = {
				from: process.env.EMAIL_USER,
				to: recipient, // list of receivers
				priority: "high",
				subject,
				html: body,
				attachments,
			};

			const info = await getMailTransporter().sendMail(options);
			console.log(info?.messageId);

			return info;
		} catch (error) {
			console.error(error);
			return 0;
		}
	},
};
