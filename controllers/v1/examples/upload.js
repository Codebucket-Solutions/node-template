const { CREATED } = require("../../../helper/status-codes");
const { uploadExampleService } = require("../../../service/v1/examples");

const uploadExample = async (req, res, next) => {
	try {
		const data = await uploadExampleService({
			file: req.file,
			body: req.body,
		});

		return res.status(CREATED).json(data);
	} catch (error) {
		return next(error);
	}
};

module.exports = {
	uploadExample,
};
