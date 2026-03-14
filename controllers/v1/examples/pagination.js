const { OK } = require("../../../helper/status-codes");
const {
	paginateOffsetExampleService,
	paginateCursorExampleService,
} = require("../../../service/v1/examples");

const paginateOffsetExample = async (req, res, next) => {
	try {
		const data = await paginateOffsetExampleService({
			query: req.query,
		});

		return res.status(OK).json(data);
	} catch (error) {
		return next(error);
	}
};

const paginateCursorExample = async (req, res, next) => {
	try {
		const data = await paginateCursorExampleService({
			query: req.query,
		});

		return res.status(OK).json(data);
	} catch (error) {
		return next(error);
	}
};

module.exports = {
	paginateOffsetExample,
	paginateCursorExample,
};
