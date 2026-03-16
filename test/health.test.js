const assert = require("assert");
const request = require("supertest");

process.env.NODE_ENV = process.env.NODE_ENV || "test";

const { loadEnvironment } = require("../config/load-env");

loadEnvironment(process.env.NODE_ENV);

const app = require("../app");

describe("health route", () => {
	it("returns a success payload without requiring database access", async () => {
		const response = await request(app).get("/v1/health");

		assert.strictEqual(response.status, 200);
		assert.strictEqual(response.body.status, "success");
		assert.strictEqual(response.body.data.ok, true);
		assert.strictEqual(response.body.data.environment, "test");
		assert.ok(response.body.data.timestamp);
	});
});
