const validateToken = require('./auth')
const validator = require('./validator')
const dispatcher = require('./dispatcher')
const handleError = require('./handle-error')
const { trimMiddleware } = require("./trim");

module.exports = {
    validateToken,
    validator,
    dispatcher,
    handleError,
    trimMiddleware,
}