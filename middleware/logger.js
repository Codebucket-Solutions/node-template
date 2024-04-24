const { v4: uuidv4 } = require("uuid");
const logger = require("../utils/logger");
const requestLogger = require("pino-http")({
  // Reuse an existing logger instance
  logger: logger,

  // Define a custom request id function
  genReqId: function (req, res) {
    const existingID = req.id ?? req.headers["x-request-id"];
    if (existingID) return existingID;
    const id = uuidv4();
    res.setHeader("X-Request-Id", id);
    return id;
  },

  // Set to `false` to prevent standard serializers from being wrapped.
  wrapSerializers: true,

  // Define a custom logger level
  customLogLevel: function (req, res, err) {
    if (res.statusCode >= 400 && res.statusCode < 500) {
      return "warn";
    } else if (res.statusCode >= 500 || err) {
      return "error";
    } else if (res.statusCode >= 300 && res.statusCode < 400) {
      return "silent";
    }
    return "info";
  },

  // Define a custom success message
  customSuccessMessage: function (req, res) {
    if (res.statusCode === 404) {
      return `${req.method} ${req.originalUrl} resource not found`;
    }
    return `${req.method} ${req.originalUrl} ${res.statusCode} completed`;
  },

  // Define a custom receive message
  customReceivedMessage: function (req, res) {
    return `request received: ${req.method} ${req.originalUrl}`;
  },

  // Define a custom error message
  customErrorMessage: function (req, res, err) {
    return `${req.method} ${req.originalUrl} request errored with status code: ${res.statusCode}`;
  },

  // Override attribute keys for the log object
  customAttributeKeys: {
    req: "request",
    res: "response",
    err: "error",
  },

  serializers: {
    res(res) {
      //here we are adding response body to log

      const headers = res.headers;
      //fastest way to check response body size
      //(We do not want to add large response to log) (adjust size accordingly)
      if (
        headers["content-length"] &&
        parseInt(headers["content-length"]) < 1000
      ) {
        res.body = res.raw.body;
      }

      return res;
    },
  },

  // Define additional custom request properties
  customProps: function (req, res) {
    return {
      requestId: req.id,
      user: req.user,
      requestBody: req.body,
    };
  },
});

const middleware = (req, res, next) => {
  let original = res.json;

  //Adding response body to res object for use in logging (Remove if not required)
  res.json = (data) => {
    res.body = data;
    res.json = original;
    res.json(data);
  };

  requestLogger(req, res);
  next();
};

module.exports = middleware;
