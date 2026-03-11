const nodemailer = require("nodemailer");
const { createTransport } = require("@codebucket/mail-transport");

let transporter = null;

if (process.env.EMAIL_TRANSPORT === "SMTP") {
	transporter = nodemailer.createTransport({
		host: process.env.EMAIL_HOST,
		port: process.env.EMAIL_PORT,
		secure: false,
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASSWORD,
		},
	});
} else {
	transporter = nodemailer.createTransport(
		createTransport({
			url: process.env.MAILSERVER_URL,
			senderId: process.env.MAILSERVER_SENDERID,
			accessToken: process.env.MAILSERVER_ACCESSTOKEN,
		}),
	);
}

transporter.verify(error => {
	if (error) {
		console.error(error);
	} else {
		console.log(`Success`);
	}
});

module.exports = {
	sendMail: async (recipient, subject, body, attachments = []) => {
		try {
			const options = {
				from: `${process.env.EMAIL_USER}`, // sender address
				to: recipient, // list of receivers
				priority: "high",
				subject,
				html: body,
				attachments,
			};

			transporter.sendMail(options, (error, info) => {
				if (error) {
					console.error(error);
				}

				console.log(info?.messageId);
			});
		} catch (error) {
			console.log(error);
		}
	},
};
