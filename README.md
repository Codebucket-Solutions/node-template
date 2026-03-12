# Node Backend Template

Production-ready Node.js/Express.js backend template for building scalable, secure APIs with standardized patterns and best practices.

**Maintained by:** Codebucket Solutions Pvt. Ltd.

📚 **Documentation**: See [`docs/`](./docs) for detailed usage guides.
Workflow engine guide: [`service/v1/workflow-engine/README.md`](./service/v1/workflow-engine/README.md)

## 🤖 Codex / Agent-Ready Additions

This template now includes an additive repository operating layer for Codex and other coding agents while preserving the existing backend template structure.

### Added capabilities

- `AGENTS.md` for repo-level operating guidance
- `.codex/config.toml` for trusted project-scoped Codex defaults
- `docs/ARCHITECTURE.md`, `docs/WORKFLOW.md`, `docs/QUALITY.md`, `docs/SECURITY.md`, and `docs/RELIABILITY.md`
- execution plans under `docs/exec-plans/`
- deterministic worktree bootstrap script
- repository verification and quality scoring scripts
- CI workflow for baseline enforcement
- Codex app setup guide in `docs/CODEX_APP_SETUP.md`

### Recommended commands

```bash
npm run worktree:bootstrap
npm run verify
npm run plan:new -- --slug=my-task --title="My Task"
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ (Node 20+ recommended)
- MySQL 5.7+
- Redis (for production rate limiting)

### Installation

```bash
# Clone the repository
git clone https://github.com/Codebucket-Solutions/node-template.git
cd node-template

# Install dependencies
npm install

# Set up environment
cp .env.development .env.local
# Edit .env.local with your database credentials

# Run in development mode
npm run start:dev
```

The server will start on `http://localhost:9000` (configurable via `PORT` in `.env`).

---

## 📁 Project Structure

```
node-template/
├── bin/
│   └── www                    # Server entry point with clustering
├── config/
│   └── db.js                  # Database configuration
├── controllers/               # Request handlers (versioned)
│   └── v1/
├── helper/                    # Helper utilities
├── instrumentation/           # Optional runtime bootstrap hooks (OpenTelemetry stub)
├── middleware/                # Express middleware
│   ├── auth.js                # JWT authentication
│   ├── validator.js           # Request validation
│   ├── dispatcher.js          # Permission-based routing
│   ├── rate-limiter.js        # Rate limiting
│   ├── logger.js              # Request logging
│   └── handle-error.js        # Error handling
├── models/                    # Sequelize models
├── routes/                    # API routes (versioned)
│   └── v1/
├── service/                   # Business logic layer
│   └── v1/                    # Includes workflow/assignment orchestration services
├── utils/                     # Utility functions
├── plop-templates/            # Code generation templates
├── app.js                     # Express app configuration
└── package.json
```

---

## 🏗️ Architecture

### Layered Architecture

```
Request → Routes → Middleware → Controllers → Services → Models → Database
```

**Middleware Chain:**

```
CORS & Helmet (Security)
   ↓
Global Rate Limiter
   ↓
Body Parser
   ↓
Logger (Pino)
   ↓
Routes
   ↓
Authentication & Authorization (Casbin)
   ↓
Validation (Joi)
   ↓
Controller
   ↓
Service Layer
   ↓
Database (Sequelize ORM)
```

### Versioned API Design

APIs are organized by version for backward compatibility:

```
/v1/general/endpoint
/v2/general/endpoint
```

---

## ✨ Key Features

### 1. **Rate Limiting** 🛡️

Environment-aware rate limiting with automatic store selection:

- **Development**: In-memory store (no setup required)
- **Production**: Redis store (distributed rate limiting)

**Available Limiters:**

| Limiter         | Limit   | Window | Use Case                      |
| --------------- | ------- | ------ | ----------------------------- |
| `globalLimiter` | 100 req | 15 min | All routes (applied globally) |
| `authLimiter`   | 5 req   | 15 min | Login/auth endpoints          |
| `apiLimiter`    | 30 req  | 1 min  | High-traffic endpoints        |
| `uploadLimiter` | 10 req  | 1 hour | File uploads                  |

📖 **[View detailed usage guide →](./docs/rate-limiter.md)**

### 2. **Authentication & Authorization** 🔐

- **JWT-based authentication** with token validation middleware
- **Casbin RBAC** for fine-grained permission control
- **Dispatcher pattern** for centralized permission checking

### 3. **Request Validation** ✅

Joi-based schema validation middleware for request body, query, and params validation.

### 4. **Logging** 📝

- **Pino** for high-performance structured logging
- **Custom log server transport** (`@codebucket/logserver-transport`)
- Request/response logging with correlation IDs

### 4.1 **Observability Bootstrap Stub** 📡

- Disabled-by-default OpenTelemetry bootstrap in `instrumentation/opentelemetry.js`
- Worker startup loads the stub before `app.js`, which is where a real SDK should be initialized
- Shutdown hook included so future exporters can flush on `SIGINT` and `SIGTERM`

📖 **[View OpenTelemetry stub guide →](./docs/opentelemetry.md)**

### 5. **Database Management** 🗄️

- **Sequelize ORM** with MySQL support
- **Transaction support** using CLS (Continuation Local Storage)
- **Model auto-initialization** with migration support
- **Connection pooling** (max 1000 connections)

### 6. **Security** 🔒

- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing
- **Bcrypt** - Password hashing
- **Input trimming** - Automatic whitespace removal
- **ClamAV virus scanning** (optional)
- **Rate limiting** - DDoS protection

### 7. **Code Quality** 📐

- **ESLint** - Code linting and quality checks
- **Prettier** - Automatic code formatting
- **EditorConfig** - Consistent editor settings across IDEs
- **Pre-commit hooks** - Automatic linting before commits
- **IDE integration** - VSCode, WebStorm, and others

📖 **[View code quality guide →](./docs/code-quality.md)**

### 8. **Code Generation** ⚡

Built-in Plop.js generators for scaffolding:

```bash
npm run plop
```

**Generates:**

- Versioned route files
- Controller boilerplate
- Service layer logic

### 9. **File Upload** 📤

- **Formidable** for multipart form handling
- **AWS S3** integration
- **Virus scanning** support (ClamAV)
- **Upload rate limiting**

### 10. **Workflow & Assignment Engine** 🔄

- **Sequelize-backed assignment rules** for auto-assignment and reassignment
- **Workflow action timeline** for application-level state transitions
- **Escalation matrix** for stage/action-driven routing and auto escalation
- **Resolver-based assignee lookup** for context-sensitive assignment flows

📖 **[View workflow engine guide →](./service/v1/workflow-engine/README.md)**

### 10. **Email Notifications** 📧

- **Nodemailer** with Zoho SMTP
- **OTP templates** (`sys_otp_template` model)
- Template-based email rendering

### 11. **Clustering** 🔄

Multi-core support using Node.js cluster module for improved performance and scalability.

---

## 🛠️ Scripts

```bash
# Development (with auto-reload)
npm run start:dev

# Production (Node 20+)
npm start

# Production (Node 16)
npm run start:16

# Code generation
npm run plop

# Testing
npm run test:dev
```

---

## 🌍 Environment Variables

Create `.env.development` or `.env.production`:

```bash
# Database
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=your_database

# Server
PORT=9000
NODE_ENV=development

# JWT
JWT_PRIVATE_KEY=your_secret_key

# Email
EMAIL_TRANSPORT=SMTP
EMAIL_HOST=smtp.zoho.in
EMAIL_PORT=465
EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_email_password

# Mail server transport (used when EMAIL_TRANSPORT is not SMTP)
MAILSERVER_URL=
MAILSERVER_SENDERID=
MAILSERVER_ACCESSTOKEN=

# SMS
SMS_TRANSPORT=GOVT
SMS_SERVER_URL=
SMS_SENDER_ID=
SMS_ACCESS_TOKEN=
PASSWORDSMS=
ENDPOINT=
KEY=
SENDERID=
USERNAMESMS=

# Redis (Production Rate Limiting)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=

# Optional Features
VIRUS_CHECKER=OFF
BASEURL=http://localhost:9000/
```

---

## 📖 Usage Examples

### Creating a New API Endpoint

**1. Generate files:**

```bash
npm run plop
# Select: route, controller, service
# Enter: version=v1, group=products, name=create
```

**2. Define model** (`models/products.js`):

```javascript
module.exports = function (sequelize, DataTypes) {
	return sequelize.define("products", {
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		name: { type: DataTypes.STRING, allowNull: false },
		price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
	});
};
```

**3. Implement service** (`service/v1/products.js`):

```javascript
const { products } = require("../../models");

const createProduct = async data => {
	return await products.create(data);
};

module.exports = { createProduct };
```

**4. Implement controller** (`controllers/v1/products.js`):

```javascript
const { createProduct } = require("../../service/v1/products");

const create = async (req, res) => {
	const product = await createProduct(req.body);
	return res.json({ success: true, data: product });
};

module.exports = { create };
```

**5. Define route** (`routes/v1/products/create.js`):

```javascript
const express = require("express");
const router = express.Router();
const { dispatcher, validateToken, apiLimiter } = require("../../../middleware");
const { create } = require("../../../controllers/v1/products");
const { PERMS, RESOURCES } = require("../../../utils/constant");

router.post("/", validateToken, apiLimiter, (req, res, next) =>
	dispatcher(req, res, next, create, RESOURCES.PRODUCTS, PERMS.ADD),
);

module.exports = router;
```

---

## 🐳 Docker Deployment

### Basic Deployment

```bash
docker build -t node-template .
docker run -p 3000:3000 --env-file .env.production node-template
```

### Docker Compose

```bash
docker-compose up -d
```

**Production Setup:**

- Uses internal registry: `harbor.internal.codebuckets.in`
- NPM registry: `https://npm.internal.codebuckets.in`

---

## 🧪 Testing Rate Limits

```bash
# Make multiple requests to test rate limiting
for i in {1..101}; do
  curl http://localhost:9000/v1/endpoint
done

# Check rate limit headers
curl -i http://localhost:9000/v1/endpoint
```

**Response Headers:**

```
RateLimit-Limit: 100
RateLimit-Remaining: 99
RateLimit-Reset: 900
```

**Rate Limit Exceeded (429):**

```json
{
	"success": false,
	"message": "Too many requests from this IP, please try again later."
}
```

---

## 🔧 Configuration Tips

### Adjusting Rate Limits

Edit `middleware/rate-limiter.js`:

```javascript
const customLimiter = createLimiter({
	windowMs: 10 * 60 * 1000, // 10 minutes
	max: 50, // 50 requests
	message: { success: false, message: "Custom message" },
	prefix: "rl:custom:",
});
```

### User-Based Rate Limiting

```javascript
const userLimiter = createLimiter({
	windowMs: 15 * 60 * 1000,
	max: 200,
	keyGenerator: req => req.user?.id || req.ip,
});
```

### Increasing Worker Processes

Edit `bin/www`:

```javascript
const cpu = require("os").cpus().length;
for (let i = 0; i < cpu; i++) {
	// Use all CPU cores
	cluster.fork();
}
```

---

## 📚 System Models

### Included System Tables

- **`sys_tables`** - Dynamic table configuration
- **`sys_dropdown_list`** - Dropdown options
- **`sys_otp_template`** - OTP email templates
- **`casbin_rule`** - RBAC policies

---

## 🎯 Best Practices

✅ **Always use transactions** for multi-step database operations  
✅ **Apply appropriate rate limiters** to different endpoint types  
✅ **Validate all inputs** using Joi schemas  
✅ **Use Casbin dispatcher** for permission checks  
✅ **Log important events** with proper context  
✅ **Handle errors centrally** using error middleware  
✅ **Use environment variables** for configuration  
✅ **Version your APIs** for backward compatibility  
✅ **Test thoroughly** before production deployment

---

## 🤝 Contributing

This is an internal template maintained by Codebucket Solutions. For issues or suggestions, please contact the development team.

---

## 📄 License

ISC License - Copyright © Codebucket Solutions Pvt. Ltd.

---

## 🆘 Troubleshooting

### Database Connection Refused

```bash
# Check MySQL is running
mysql.server status

# Verify credentials in .env
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=your_password
```

### Redis Connection Failed (Production)

```bash
# Check Redis is running
redis-cli ping  # Should return PONG

# System will fallback to memory store with warning
```

### Rate Limiter Not Working

- Verify middleware is imported in `app.js`
- Check environment configuration
- Review console logs for initialization messages

### Port Already in Use

```bash
# Find process using port 9000
lsof -ti:9000 | xargs kill -9

# Or change PORT in .env
PORT=9001
```

---

## 📞 Support

For internal support, contact: **team@thecodebucket.com**

Repository: https://github.com/Codebucket-Solutions/node-template

## Symphony support

This template now includes a root `WORKFLOW.md`, `scripts/symphony-bootstrap.sh`, and `docs/SYMPHONY_SETUP.md` so it can be used with OpenAI Symphony in addition to Codex worktree workflows.
