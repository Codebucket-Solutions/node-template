const axios = require("axios");
const { PASSWORDSMS, ENDPOINT, KEY, SENDERID, USERNAMESMS } = process.env;
const { encryptedPassword, hashGenerator } = require("./message-helper");

module.exports = {
	messenger: async (message, phone, DLT) => {
		try {
			const encPassword = encryptedPassword(PASSWORDSMS),
				templateId = DLT;

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
		} catch (error) {
			console.log(error);
			return 0;
		}
	},
	generateOtp: (lenght = 4) => {
		try {
			const string = "123456789";
			let OTP = "";
			const len = string.length;
			for (let i = 0; i < lenght; i++) {
				OTP += string[Math.floor(Math.random() * len)];
			}
			return OTP;
		} catch (error) {
			console.log(error);
			throw error;
		}
	},
};
