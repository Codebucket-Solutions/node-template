const { CREATED } = require("../../../helper/status-codes");
const { renderPdfExampleService } = require("../../../service/v1/examples");

const renderPdfExample = async (req, res, next) => {
	try {
		const data = await renderPdfExampleService({
			body: req.body,
		});

		return res.status(CREATED).json(data);
	} catch (error) {
		return next(error);
	}
};

module.exports = {
	renderPdfExample,
};
