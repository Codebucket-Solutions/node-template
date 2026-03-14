# Rate Limiter - Usage Guide

## Overview

The template includes environment-aware rate limiting that automatically switches between:

- **Development**: In-memory store (no external dependencies)
- **Production**: Redis store (distributed rate limiting across multiple servers)

## Available Rate Limiters

### 1. Global Limiter

```javascript
const { globalLimiter } = require("./middleware");
```

- **Limit**: 100 requests per 15 minutes
- **Applied**: Globally to all routes in `app.js`
- **Purpose**: General API protection against abuse
- **Scope**: Per IP address

### 2. Auth Limiter

```javascript
const { authLimiter } = require("./middleware");
```

- **Limit**: 5 requests per 15 minutes
- **Applied**: Login, register, password reset endpoints
- **Purpose**: Prevent brute force attacks
- **Special**: Skips counting successful authentication attempts
- **Scope**: Per IP address

### 3. API Limiter

```javascript
const { apiLimiter } = require("./middleware");
```

- **Limit**: 30 requests per minute
- **Applied**: High-traffic or sensitive API endpoints
- **Purpose**: Fine-grained control over specific endpoints
- **Scope**: Per IP address

### 4. Upload Limiter

```javascript
const { uploadLimiter } = require("./middleware");
```

- **Limit**: 10 requests per hour
- **Applied**: File upload endpoints
- **Purpose**: Prevent storage abuse and excessive uploads
- **Scope**: Per IP address

---

## Usage Examples

### Example 1: Protecting Authentication Routes

**File**: `routes/v1/auth/login.js`

```javascript
const express = require("express");
const router = express.Router();
const { dispatcher, authLimiter } = require("../../../middleware");
const { login, register, resetPassword, requestOTP } = require("../../../controllers/v1/auth");
const { PERMS, RESOURCES } = require("../../../utils/constant");

// Apply strict rate limiting to all auth routes
router.post("/login", authLimiter, (req, res, next) =>
	dispatcher(req, res, next, login, RESOURCES.AUTH, PERMS.VIEW),
);

router.post("/register", authLimiter, (req, res, next) =>
	dispatcher(req, res, next, register, RESOURCES.AUTH, PERMS.ADD),
);

router.post("/reset-password", authLimiter, (req, res, next) =>
	dispatcher(req, res, next, resetPassword, RESOURCES.AUTH, PERMS.EDIT),
);

router.post("/request-otp", authLimiter, (req, res, next) =>
	dispatcher(req, res, next, requestOTP, RESOURCES.AUTH, PERMS.VIEW),
);

module.exports = router;
```

### Example 2: File Upload Routes

**File**: `routes/v1/examples/upload.js`

```javascript
const express = require("express");
const router = express.Router();
const { dispatcher, uploadLimiter, validateToken } = require("../../../middleware");
const { uploadExample } = require("../../../controllers/v1/examples/upload");
const {
	createMimeTypeFilter,
	createSingleUploadMiddleware,
} = require("../../../middleware/multer");
const { PERMS, RESOURCES } = require("../../../utils/constant");

const uploadExampleMiddleware = createSingleUploadMiddleware({
	directory: "documents",
	fieldName: "file",
	fileFilter: createMimeTypeFilter({
		allowedMimes: ["application/pdf"],
		message: "Only PDF files are allowed",
	}),
	limits: {
		fileSize: 10 * 1024 * 1024,
	},
});

// Apply upload rate limiting to prevent abuse
router.post("/upload", validateToken, uploadLimiter, uploadExampleMiddleware, (req, res, next) =>
	dispatcher(req, res, next, uploadExample, RESOURCES.UPLOAD, PERMS.ADD),
);

module.exports = router;
```

### Example 3: Applying Limiter to Entire Route Group

**File**: `routes/v1/api/data.js`

```javascript
const express = require("express");
const router = express.Router();
const { apiLimiter, validateToken } = require("../../../middleware");
const { getData, createData, updateData, deleteData } = require("../../../controllers/v1/data");

// Apply API limiter to all routes in this router
router.use(apiLimiter);

// All routes below will have the API rate limiter applied
router.get("/", validateToken, getData);
router.post("/", validateToken, createData);
router.put("/:id", validateToken, updateData);
router.delete("/:id", validateToken, deleteData);

module.exports = router;
```

### Example 4: Multiple Limiters on Same Route

**File**: `routes/v1/admin/bulk-import.js`

```javascript
const express = require("express");
const router = express.Router();
const { apiLimiter, uploadLimiter, validateToken } = require("../../../middleware");
const { bulkImport } = require("../../../controllers/v1/admin");

// Apply both API limiter AND upload limiter for extra protection
router.post("/", validateToken, apiLimiter, uploadLimiter, bulkImport);

module.exports = router;
```

### Example 5: Conditional Rate Limiting

**File**: `routes/v1/public/search.js`

```javascript
const express = require("express");
const router = express.Router();
const { apiLimiter, validateToken } = require("../../../middleware");
const { search } = require("../../../controllers/v1/search");

// Apply rate limiter only to unauthenticated requests
router.get(
	"/",
	(req, res, next) => {
		if (!req.headers.authorization) {
			return apiLimiter(req, res, next);
		}
		next();
	},
	search,
);

module.exports = router;
```

---

## Configuration

### Environment Variables

Add to your `.env.development` or `.env.production`:

```bash
# Redis Configuration (required for production)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
```

### Environment-Based Store Selection

The rate limiter automatically selects the appropriate store:

```javascript
// Development (NODE_ENV !== 'production')
// Uses in-memory store
// Limits reset on server restart
// No Redis required

// Production (NODE_ENV === 'production')
// Uses Redis store
// Limits persist across server restarts
// Shared across multiple server instances
```

---

## Response Format

### Successful Request

**Response Headers:**

```http
RateLimit-Policy: 100;w=900
RateLimit-Limit: 100
RateLimit-Remaining: 99
RateLimit-Reset: 900
```

- `RateLimit-Limit`: Maximum requests allowed in the window
- `RateLimit-Remaining`: Number of requests remaining
- `RateLimit-Reset`: Seconds until the rate limit resets

### Rate Limit Exceeded

**Status Code**: `429 Too Many Requests`

**Response Body**:

```json
{
	"success": false,
	"message": "Too many requests from this IP, please try again later."
}
```

**Response Headers**:

```http
RateLimit-Limit: 100
RateLimit-Remaining: 0
RateLimit-Reset: 523
Retry-After: 523
```

---

## Custom Rate Limiters

### Creating a Custom Limiter

**File**: `middleware/rate-limiter.js`

Add your custom limiter using the `createLimiter` helper:

```javascript
/**
 * Custom limiter for payment endpoints
 * 3 requests per 5 minutes
 */
const paymentLimiter = createLimiter({
	windowMs: 5 * 60 * 1000, // 5 minutes
	max: 3, // 3 requests per window
	message: {
		success: false,
		message: "Too many payment requests. Please wait before trying again.",
	},
	prefix: "rl:payment:", // Redis key prefix
	skipSuccessfulRequests: false,
	skipFailedRequests: false,
});

module.exports = {
	globalLimiter,
	authLimiter,
	apiLimiter,
	uploadLimiter,
	paymentLimiter, // Export your custom limiter
};
```

Then use it in your routes:

```javascript
const { paymentLimiter } = require("../../../middleware");

router.post("/process-payment", validateToken, paymentLimiter, processPayment);
```

### User-Based Rate Limiting

For authenticated endpoints, rate limit by user ID instead of IP:

```javascript
const userBasedLimiter = createLimiter({
	windowMs: 15 * 60 * 1000,
	max: 200, // Higher limit for authenticated users
	keyGenerator: req => {
		// Use user ID if authenticated, otherwise fall back to IP
		return req.user?.id || req.ip;
	},
	message: {
		success: false,
		message: "Too many requests for this account.",
	},
	prefix: "rl:user:",
});
```

### Tiered Rate Limiting

Different limits based on user subscription tier:

```javascript
const tieredLimiter = createLimiter({
	windowMs: 15 * 60 * 1000,
	max: req => {
		if (req.user?.tier === "premium") return 1000;
		if (req.user?.tier === "basic") return 100;
		return 50; // Anonymous/free users
	},
	keyGenerator: req => req.user?.id || req.ip,
	message: {
		success: false,
		message: "Rate limit exceeded. Upgrade to premium for higher limits.",
	},
	prefix: "rl:tiered:",
});
```

### Skip Rate Limiting for Admins

```javascript
const adminExemptLimiter = createLimiter({
	windowMs: 15 * 60 * 1000,
	max: 100,
	skip: req => {
		// Skip rate limiting for admin users
		return req.user?.role === "admin" || req.user?.role === "superadmin";
	},
	prefix: "rl:admin-exempt:",
});
```

---

## Testing

### Manual Testing

**1. Test with curl:**

```bash
# Single request
curl -i http://localhost:9000/v1/login

# Multiple requests to trigger rate limit
for i in {1..6}; do
  curl -i http://localhost:9000/v1/login -d '{"email":"test@test.com"}' -H "Content-Type: application/json"
  sleep 1
done
```

**2. Check rate limit headers:**

```bash
curl -i http://localhost:9000/v1/endpoint | grep RateLimit
```

**3. Test Redis integration (production):**

```bash
# Set environment and start server
NODE_ENV=production npm start

# Check Redis keys
redis-cli KEYS "rl:*"

# Monitor rate limit counters
redis-cli MONITOR
```

### Automated Testing

**File**: `test/rate-limiter.test.js`

```javascript
const request = require("supertest");
const app = require("../app");

describe("Rate Limiter", () => {
	it("should allow requests within limit", async () => {
		const res = await request(app).get("/v1/endpoint").expect(200);

		expect(res.headers["ratelimit-remaining"]).toBeDefined();
	});

	it("should block requests exceeding limit", async () => {
		// Make requests up to the limit
		for (let i = 0; i < 100; i++) {
			await request(app).get("/v1/endpoint");
		}

		// 101st request should be blocked
		const res = await request(app).get("/v1/endpoint").expect(429);

		expect(res.body.success).toBe(false);
		expect(res.body.message).toContain("Too many requests");
	});
});
```

---

## Monitoring & Debugging

### Console Logs

The rate limiter logs initialization messages:

**Development:**

```
Using memory store for rate limiting (development mode)
```

**Production (successful):**

```
Redis connected for rate limiting
```

**Production (fallback):**

```
Redis Client Error: [error details]
Using memory store for rate limiting as fallback
```

### Redis Monitoring

```bash
# View all rate limit keys
redis-cli KEYS "rl:*"

# Monitor real-time operations
redis-cli MONITOR | grep rl:

# Check specific key
redis-cli GET "rl:global:127.0.0.1"

# Get TTL (time to live)
redis-cli TTL "rl:global:127.0.0.1"
```

### Application Metrics

Track rate limit metrics in your monitoring system:

```javascript
const { redisClient } = require("./middleware/rate-limiter");

// Monitor rate limit hits
app.use((req, res, next) => {
	const remaining = res.getHeader("RateLimit-Remaining");
	if (remaining === "0") {
		console.warn("Rate limit hit:", { ip: req.ip, path: req.path });
		// Send to monitoring service (e.g., DataDog, New Relic)
	}
	next();
});
```

---

## Troubleshooting

### Rate Limiter Not Working

**1. Check middleware import:**

```javascript
const { globalLimiter } = require("./middleware");
```

**2. Verify middleware is applied:**

```javascript
app.use(globalLimiter); // Should be before routes
```

**3. Check console logs:**
Look for initialization messages indicating which store is being used.

### Redis Connection Issues

**1. Verify Redis is running:**

```bash
redis-cli ping  # Should return PONG
```

**2. Check environment variables:**

```bash
echo $REDIS_HOST
echo $REDIS_PORT
```

**3. Test connection:**

```bash
redis-cli -h $REDIS_HOST -p $REDIS_PORT -a $REDIS_PASSWORD ping
```

**4. Check firewall/network:**
Ensure Redis port (6379) is accessible from your application server.

### Rate Limits Not Resetting

**Development (memory store):**

- Limits reset on server restart
- Each server instance has its own limits

**Production (Redis store):**

```bash
# Check TTL of keys
redis-cli TTL "rl:global:127.0.0.1"

# Manually clear if needed (use with caution)
redis-cli DEL "rl:global:127.0.0.1"

# Clear all rate limit keys (emergency only)
redis-cli KEYS "rl:*" | xargs redis-cli DEL
```

### Different Behavior Across Instances

If using multiple server instances without Redis:

- Each instance maintains its own rate limit counters
- Users could bypass limits by hitting different instances
- **Solution**: Use Redis in production

---

## Best Practices

✅ **Apply global limiter** to protect all routes by default  
✅ **Use stricter limits for auth endpoints** to prevent brute force  
✅ **Use Redis in production** for distributed rate limiting  
✅ **Monitor rate limit headers** to understand usage patterns  
✅ **Adjust limits based on requirements** after analyzing usage  
✅ **Test thoroughly** before deploying new rate limits  
✅ **Set up Redis monitoring** to detect connection issues  
✅ **Use custom messages** to guide users on retry timing  
✅ **Consider user-based limiting** for authenticated endpoints  
✅ **Exempt admins/internal services** from strict limits when appropriate

---

## Performance Impact

- **Memory Store**: ~1ms overhead per request
- **Redis Store**: ~2-5ms overhead per request (depending on network latency)
- **Memory Usage**: ~1KB per unique IP/user per time window
- **Redis Memory**: Automatically expires keys after time window

---

## Security Considerations

🔒 **IP Spoofing**: Consider using `X-Forwarded-For` in trusted proxy environments  
🔒 **Distributed Attacks**: Redis store helps mitigate distributed attacks  
🔒 **Application-Level DoS**: Combine with server-level rate limiting (nginx, etc.)  
🔒 **Credential Stuffing**: Auth limiter helps prevent automated credential attacks  
🔒 **Resource Exhaustion**: Upload limiter prevents storage/bandwidth abuse

---

## Migration Guide

### Adding Rate Limiting to Existing Routes

**1. Import the limiter:**

```javascript
const { apiLimiter } = require("../../../middleware");
```

**2. Add to route definition:**

```javascript
// Before
router.post("/data", validateToken, createData);

// After
router.post("/data", validateToken, apiLimiter, createData);
```

**3. Test in development first:**

```bash
npm run start:dev
```

**4. Deploy to production with Redis configured:**

```bash
NODE_ENV=production npm start
```

---

For questions or issues, contact: **team@thecodebucket.com**
