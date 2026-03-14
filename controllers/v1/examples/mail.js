const { OK } = require("../../../helper/status-codes");
const { sendMailExampleService } = require("../../../service/v1/examples");

const sendMailExample = async (req, res, next) => {
	try {
		const data = await sendMailExampleService({
			body: req.body,
		});

		return res.status(OK).json(data);
	} catch (error) {
		return next(error);
	}
};

module.exports = {
	sendMailExample,
};
