class ErrorHandler extends Error {
	constructor(statusCode, message) {
		super();
		this.statusCode = statusCode;
		this.message = message;
	}
}

/**
 * Get an environment variable or throw an error if it is not set.
 * @param {string} key - The environment variable key.
 * @returns {string} The environment variable value.
 */
const getOrThrow = key => {
	const value = process.env[key];

	if (value !== "" && !value) {
		throw new Error(`Environment variable ${key} is not set.`);
	}
	return value;
};

module.exports = {
	ErrorHandler,
	getOrThrow,
};
