const { MgovProvider, SmsSender, SmsServerProvider } = require("@codebucket/sms");

const SMS_TRANSPORTS = {
	GOVT: "GOVT",
	MGOV: "MGOV",
	MSG91: "MSG91",
	SERVER: "SERVER",
	SMARTSOL: "SMARTSOL",
};

let activeTransport = null;
let smsSender = null;

function getEnvValue(names) {
	for (const name of names) {
		const value = process.env[name];
		if (value !== undefined && value !== "") {
			return value;
		}
	}

	return null;
}

function getRequiredEnv(names, label) {
	const value = getEnvValue(names);
	if (!value) {
		throw new Error(`Missing required ${label}`);
	}

	return value;
}

function getSmsTransport() {
	return String(process.env.SMS_TRANSPORT || SMS_TRANSPORTS.GOVT)
		.trim()
		.toUpperCase();
}

function normalizePhoneNumber(phone) {
	const digits = String(phone || "").replace(/\D/g, "");
	if (digits.length === 10) {
		return `91${digits}`;
	}

	return digits;
}

function createSmsProvider(transport) {
	switch (transport) {
		case SMS_TRANSPORTS.SERVER:
			return new SmsServerProvider({
				smsServerUrl: getRequiredEnv(["SMS_SERVER_URL"], "SMS server URL"),
				senderId: getRequiredEnv(["SMS_SENDER_ID"], "SMS server sender id"),
				accessToken: getRequiredEnv(["SMS_ACCESS_TOKEN"], "SMS server access token"),
			});
		case SMS_TRANSPORTS.GOVT:
		case SMS_TRANSPORTS.MGOV:
			return new MgovProvider({
				url: getRequiredEnv(["MGOV_URL", "ENDPOINT"], "Mgov URL"),
				username: getRequiredEnv(["MGOV_USERNAME", "USERNAMESMS"], "Mgov username"),
				password: getRequiredEnv(["MGOV_PASSWORD", "PASSWORDSMS"], "Mgov password"),
				senderId: getRequiredEnv(["MGOV_SENDER_ID", "SENDERID"], "Mgov sender id"),
				secureKey: getRequiredEnv(["MGOV_SECURE_KEY", "KEY"], "Mgov secure key"),
			});
		default:
			throw new Error(`Unsupported SMS transport: ${transport}`);
	}
}

function getSmsSender(transport) {
	if (!smsSender || activeTransport !== transport) {
		activeTransport = transport;
		smsSender = new SmsSender(createSmsProvider(transport));
	}

	return smsSender;
}

function buildSendOptions({ transport, message, phone, templateId, otp }) {
	const options = {
		to: [normalizePhoneNumber(phone)],
	};

	if (templateId) {
		options.templateId = templateId;
	}

	if (otp !== undefined && otp !== null) {
		options.variables = [String(otp)];
	}

	if (transport === SMS_TRANSPORTS.SERVER || transport === SMS_TRANSPORTS.MSG91) {
		options.type = "template";
		return options;
	}

	options.content = String(message || "").trim();
	options.type = transport === SMS_TRANSPORTS.SMARTSOL ? "text" : "otpmsg";

	return options;
}

async function sendSms({ message, phone, templateId, otp, transportOverride }) {
	const transport = transportOverride || getSmsTransport();
	const sender = getSmsSender(transport);
	const options = buildSendOptions({
		transport,
		message,
		phone,
		templateId,
		otp,
	});

	return sender.send(options);
}

module.exports = {
	messenger: async (message, phone, DLT, otp) => {
		try {
			return await sendSms({
				message,
				phone,
				templateId: DLT,
				otp,
			});
		} catch (error) {
			console.error(error);
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
			console.error(error);
			throw error;
		}
	},
	govtMessage: async (message, phone, DLT) => {
		try {
			return await sendSms({
				message,
				phone,
				templateId: DLT,
				transportOverride: SMS_TRANSPORTS.MGOV,
			});
		} catch (error) {
			console.error(error);
			return 0;
		}
	},
};
