const axios = require("axios");
const { SmsSender, SmsServerProvider } = require("@codebucket/sms");
const { PASSWORDSMS, ENDPOINT, KEY, SENDERID, USERNAMESMS } = process.env;
const { encryptedPassword, hashGenerator } = require("./message-helper");

module.exports = {
	messenger: async (message, phone, DLT, otp) => {
		try {
			if (process.env.SMS_TRANSPORT === "SERVER") {
				const smsSender = new SmsSender(
					new SmsServerProvider({
						smsServerUrl: process.env.SMS_SERVER_URL,
						senderId: process.env.SMS_SENDER_ID,
						accessToken: process.env.SMS_ACCESS_TOKEN,
					}),
				);

				const variables = [String(otp)];

				await smsSender.send({
					type: "template",
					to: [`91${phone}`],
					templateId: DLT,
					variables,
				});

				console.log(message);
			} else {
				const encPassword = encryptedPassword(PASSWORDSMS);
				const templateId = DLT;
				const finalMessage = message.trim();
				const hash = await hashGenerator(USERNAMESMS, SENDERID, finalMessage, KEY);
				const query = `username=${USERNAMESMS}&password=${encPassword}&smsservicetype=otpmsg&content=${finalMessage}&mobileno=${phone}&senderid=${SENDERID}&key=${hash}&templateid=${templateId}`;

				axios
					.post(ENDPOINT, query)
					.then(async resp => {
						console.log(resp.data);
					})
					.catch(error => {
						console.error(error);
						throw error;
					});
			}
		} catch (error) {
			console.log(error);
			return 0;
		}
	},
	generateOtp: (length = 4) => {
		try {
			const string = "123456789";
			let OTP = "";
			const len = string.length;
			for (let i = 0; i < length; i++) {
				OTP += string[Math.floor(Math.random() * len)];
			}
			return OTP;
		} catch (error) {
			console.log(error);
			throw error;
		}
	},
	govtMessage: async (message, phone, DLT) => {
		const encPassword = encryptedPassword(PASSWORDSMS);
		const templateId = DLT;
		const hash = await hashGenerator(USERNAMESMS, SENDERID, message.trim(), KEY);
		const query = `username=${USERNAMESMS}&password=${encPassword}&smsservicetype=otpmsg&content=${message.trim()}&mobileno=${phone}&senderid=${SENDERID}&key=${hash}&templateid=${templateId}`;

		axios
			.post(ENDPOINT, query)
			.then(async resp => {
				console.log(resp.data);
			})
			.catch(error => {
				console.error(error);
				throw error;
			});
	},
};
