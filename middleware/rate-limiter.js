const rateLimit = require("express-rate-limit");

let RedisStore, redisClient;

// Conditionally load Redis dependencies only in production
if (process.env.NODE_ENV === "production") {
	try {
		RedisStore = require("rate-limit-redis").default;
		const redis = require("redis");

		// Create Redis client for production
		redisClient = redis.createClient({
			socket: {
				host: process.env.REDIS_HOST || "localhost",
				port: process.env.REDIS_PORT || 6379,
			},
			password: process.env.REDIS_PASSWORD || undefined,
		});

		redisClient.on("error", err => {
			console.error("Redis Client Error:", err);
			console.warn("Falling back to memory store for rate limiting");
		});

		redisClient.on("connect", () => {
			console.log("Redis connected for rate limiting");
		});

		// Connect to Redis
		redisClient.connect().catch(err => {
			console.error("Failed to connect to Redis:", err);
			console.warn("Using memory store for rate limiting as fallback");
		});
	} catch (error) {
		console.error("Failed to initialize Redis for rate limiting:", error);
		console.warn("Using memory store for rate limiting");
	}
} else {
	console.log("Using memory store for rate limiting (development mode)");
}

/**
 * Helper function to create rate limiter with appropriate store
 */
const createLimiter = config => {
	const { prefix, ...otherConfig } = config; // Extract prefix separately

	const limiterConfig = {
		...otherConfig,
		standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
		legacyHeaders: false, // Disable the `X-RateLimit-*` headers
	};

	// Use Redis store in production if available
	if (process.env.NODE_ENV === "production" && redisClient && RedisStore) {
		try {
			limiterConfig.store = new RedisStore({
				// @ts-expect-error - Known issue: the `call` function is not present in @types/node-redis
				sendCommand: (...args) => redisClient.sendCommand(args),
				prefix: prefix || "rl:",
			});
		} catch (error) {
			console.error("Failed to create Redis store, using memory store:", error);
		}
	}

	return rateLimit(limiterConfig);
};

/**
 * Global rate limiter for general API protection
 * 100 requests per 15 minutes per IP
 */
const globalLimiter = createLimiter({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100,
	message: {
		success: false,
		message: "Too many requests from this IP, please try again later.",
	},
	skipSuccessfulRequests: false,
	skipFailedRequests: false,
	prefix: "rl:global:",
});

/**
 * Strict limiter for authentication endpoints
 * 5 requests per 15 minutes per IP
 * Skips successful requests to allow legitimate users
 */
const authLimiter = createLimiter({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 5,
	message: {
		success: false,
		message: "Too many authentication attempts, please try again after 15 minutes.",
	},
	skipSuccessfulRequests: true, // Don't count successful logins
	skipFailedRequests: false,
	prefix: "rl:auth:",
});

/**
 * Moderate limiter for API endpoints
 * 30 requests per minute per IP
 */
const apiLimiter = createLimiter({
	windowMs: 1 * 60 * 1000, // 1 minute
	max: 30,
	message: {
		success: false,
		message: "Too many requests, please slow down.",
	},
	skipSuccessfulRequests: false,
	skipFailedRequests: false,
	prefix: "rl:api:",
});

/**
 * File upload limiter
 * 10 uploads per hour per IP
 */
const uploadLimiter = createLimiter({
	windowMs: 60 * 60 * 1000, // 1 hour
	max: 10,
	message: {
		success: false,
		message: "Too many file uploads, please try again later.",
	},
	skipSuccessfulRequests: false,
	skipFailedRequests: false,
	prefix: "rl:upload:",
});

module.exports = {
	globalLimiter,
	authLimiter,
	apiLimiter,
	uploadLimiter,
	redisClient, // Export for graceful shutdown if needed
};
