const { ErrorHandler, statusCodes } = require("../../../helper");
const { generateOtp, messenger } = require("../../../utils");

const { BAD_REQUEST, SERVER_ERROR } = statusCodes;
const DEFAULT_SMS_MESSAGE = "Your verification code is {{var1}}";
const TEMPLATE_REQUIRED_TRANSPORTS = new Set(["MSG91", "SERVER"]);

function normalizeOtpLength(value) {
	if (value === undefined || value === null || value === "") {
		return 4;
	}

	const otpLength = Number(value);
	if (!Number.isInteger(otpLength) || otpLength < 4 || otpLength > 8) {
		throw new ErrorHandler(BAD_REQUEST, "otpLength must be an integer between 4 and 8");
	}

	return otpLength;
}

function summarizeSmsResult(result) {
	if (result && typeof result === "object" && "status" in result && "data" in result) {
		return {
			status: result.status,
			data: result.data,
		};
	}

	return result;
}

const sendSmsExampleService = async ({ body }) => {
	const phone = String(body?.phone || "").trim();
	if (!phone) {
		throw new ErrorHandler(BAD_REQUEST, "phone is required");
	}

	const transport = String(process.env.SMS_TRANSPORT || "GOVT").toUpperCase();
	const otp = body?.otp ? String(body.otp) : generateOtp(normalizeOtpLength(body?.otpLength));
	const templateId = body?.templateId || body?.dltTemplateId || null;
	const message = String(body?.message || DEFAULT_SMS_MESSAGE).trim();
	if (TEMPLATE_REQUIRED_TRANSPORTS.has(transport) && !templateId) {
		throw new ErrorHandler(
			BAD_REQUEST,
			"templateId is required when SMS_TRANSPORT is MSG91 or SERVER",
		);
	}

	const result = await messenger(message, phone, templateId, otp);
	if (!result || result === 0) {
		throw new ErrorHandler(SERVER_ERROR, "Unable to send SMS");
	}

	return {
		message: "SMS example completed",
		transport,
		phone,
		templateId,
		otp,
		result: summarizeSmsResult(result),
	};
};

module.exports = {
	sendSmsExampleService,
};
