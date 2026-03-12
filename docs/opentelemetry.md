# OpenTelemetry Stub

This template includes an additive OpenTelemetry bootstrap stub in `instrumentation/opentelemetry.js`.

The stub is intentionally disabled by default and does not install OpenTelemetry dependencies. Its purpose is to define the integration point for teams that want tracing or metrics without changing the default template runtime.

## What the stub does

- Exposes `startOpenTelemetry()` and `shutdownOpenTelemetry()`.
- Runs before `app.js` is loaded in worker processes from `bin/www`.
- Logs when the stub is enabled so it is obvious that no real SDK is active yet.
- Registers worker shutdown hooks for `SIGINT` and `SIGTERM`.

## Enable the stub

Set the following environment variable before starting the server:

```sh
OTEL_ENABLED=true
```

Optional variables used by the stub:

- `OTEL_SERVICE_NAME`: overrides the service name reported in the stub log entry.
- `OTEL_EXPORTER_OTLP_ENDPOINT`: captured in logs so you can verify the intended exporter target during setup.

## Where to replace the stub

Use `instrumentation/opentelemetry.js` as the single bootstrap file for your real OpenTelemetry setup.

Recommended replacement approach:

1. Install the official OpenTelemetry Node SDK packages your deployment needs.
2. Initialize the SDK inside `startOpenTelemetry()` before `app.js` is required.
3. Flush and shut down the SDK inside `shutdownOpenTelemetry()`.
4. Keep `bin/www` as the only process bootstrap entry so tracing starts before Express, middleware, and outbound clients are loaded.

## Why startup happens in `bin/www`

Instrumentation has to load before the application imports modules that may be patched by telemetry libraries. In this template, `bin/www` is the earliest stable bootstrap point for worker processes, so the stub is wired there instead of in `app.js`.

## Default behavior

- No telemetry packages are required.
- No traces or metrics are emitted.
- Existing request logging and runtime behavior stay unchanged unless `OTEL_ENABLED=true` is set.
