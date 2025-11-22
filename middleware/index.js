const validateToken = require("./auth");
const validator = require("./validator");
const dispatcher = require("./dispatcher");
const handleError = require("./handle-error");
const { trimMiddleware } = require("./trim");
const { globalLimiter, authLimiter, apiLimiter, uploadLimiter } = require("./rate-limiter");

module.exports = {
	validateToken,
	validator,
	dispatcher,
	handleError,
	trimMiddleware,
	globalLimiter,
	authLimiter,
	apiLimiter,
	uploadLimiter,
};
