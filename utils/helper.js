const camelcaseKeys = require("camelcase-keys");
const { ErrorHandler } = require("../helper");
const { SERVER_ERROR } = require("../helper/status-codes");

module.exports = {
	zeroPad: (num, places) => String(num).padStart(places, "0"),
	camelize: obj => {
		try {
			return camelcaseKeys(JSON.parse(JSON.stringify(obj)), { deep: true });
		} catch (error) {
			throw new ErrorHandler(SERVER_ERROR, error);
		}
	},
};
