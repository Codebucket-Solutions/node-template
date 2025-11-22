/**
 * Middleware that trims all string values in the request body
 * Handles nested objects, arrays, and primitive values
 */
const trimMiddleware = (req, res, next) => {
	if (req.body) {
		req.body = trimObject(req.body);
	}
	next();
};

/**
 * Trims a value based on its type
 * @param value - The value to trim (string, array, or object)
 * @returns The trimmed value
 */
const trimValue = value => {
	if (typeof value === "string") {
		return value.trim();
	}

	if (Array.isArray(value)) {
		return value.map(trimValue);
	}

	if (typeof value === "object" && value !== null) {
		return trimObject(value);
	}

	return value;
};

/**
 * Recursively trims all string values in an object
 * @param obj - The object to process
 * @returns A new object with all string values trimmed
 */
const trimObject = obj => {
	if (typeof obj !== "object" || obj === null) {
		return obj;
	}

	return Object.entries(obj).reduce((acc, [key, value]) => {
		acc[key] = trimValue(value);
		return acc;
	}, {});
};

module.exports = {
	trimMiddleware,
};
