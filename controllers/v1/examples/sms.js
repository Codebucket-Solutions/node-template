const { OK } = require("../../../helper/status-codes");
const { sendSmsExampleService } = require("../../../service/v1/examples");

const sendSmsExample = async (req, res, next) => {
	try {
		const data = await sendSmsExampleService({
			body: req.body,
		});

		return res.status(OK).json(data);
	} catch (error) {
		return next(error);
	}
};

module.exports = {
	sendSmsExample,
};
