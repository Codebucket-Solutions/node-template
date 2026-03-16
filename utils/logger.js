const pino = require("pino");

const {
	NODE_ENV,
	LOGSERVER_APPLICATION,
	LOGSERVER_SERVICE,
	LOGSERVER_ENVIRONMENT,
	LOGSERVER_VERSION,
	LOGSERVER_HOST,
	LOGSERVER_BASEURL,
	LOGSERVER_API_KEY,
} = process.env;

// this writes to STDOUT
const consoleTransport = {
	target: "pino-pretty",
	options: {
		singleLine: true, // to prevent cramming up console
		//add or remove what you don't want to log accordingly
		ignore: "pid,hostname,request.id,request.headers,response.headers",
	},
};

const lokiTransport = {
	target: "pino-loki",
	options: {
		host: process.env.LOKI_URL,
		labels: {
			application: LOGSERVER_APPLICATION || "node-template",
			service: LOGSERVER_SERVICE || "app",
			environment: LOGSERVER_ENVIRONMENT || NODE_ENV || "development",
		},
		batching: true,
		propsToLabels: ["level"],
	},
};

// this sends to Logging Server (Not used in dev)
const logServerTransport = {
	target: "@codebucket/logserver-transport",
	options: {
		// application related for tagging
		application: LOGSERVER_APPLICATION, //Name of this application
		service: LOGSERVER_SERVICE, //Service (Docker, Pm2 etc)
		environment: LOGSERVER_ENVIRONMENT, //Environment
		version: LOGSERVER_VERSION, //Version Of This application
		host: LOGSERVER_HOST, //Hostname where this application is running

		//logging server related
		apiBaseUrl: LOGSERVER_BASEURL, //BaseUrl of logging server
		apiKey: LOGSERVER_API_KEY, //Api Key of logging server
		//apiLogEndpoint: //default:log

		//transport related (We send logs to server in batches)
		//batchInterval: default 5000ms
		//batchCount: default 20
		//logs will be sent when interval is crossed or count is reached
	},
};

let targets = [consoleTransport];

if (
	process.env.LOKI_URL &&
	["1", "true", "yes", "on"].includes(String(process.env.LOKI_ENABLED || "").toLowerCase())
) {
	targets = [consoleTransport, lokiTransport];
}

if (NODE_ENV === "STAGE" || NODE_ENV === "stage") {
	targets = [consoleTransport, logServerTransport];
} else if (NODE_ENV === "PRODUCTION" || NODE_ENV === "production") {
	targets = [logServerTransport];
}

const transports = pino.transport({
	targets,
});

const logger = pino(
	{
		redact: {
			//provide paths to prevent logging sensitive information
			paths: ["*.password", "*.headers.token", "*.headers.authorization"],
			censor: "[REDACTED]",
		},
	},
	transports,
);

module.exports = logger;
