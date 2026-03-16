# OpenTelemetry Bootstrap

This template includes an additive OpenTelemetry bootstrap in `instrumentation/opentelemetry.js`.

The bootstrap is intentionally disabled by default. When enabled, it starts the OpenTelemetry Node SDK before `app.js` is loaded so traces and metrics can flow to an OTLP endpoint.

## What the bootstrap does

- Exposes `startOpenTelemetry()` and `shutdownOpenTelemetry()`.
- Runs before `app.js` is loaded in worker processes from `bin/www`.
- Starts the OpenTelemetry Node SDK with auto-instrumentations.
- Exports traces and metrics over OTLP HTTP.
- Registers worker shutdown hooks for `SIGINT` and `SIGTERM`.

## Enable telemetry

Set the following environment variable before starting the server:

```sh
OTEL_ENABLED=true
```

Optional variables used by the bootstrap:

- `OTEL_SERVICE_NAME`: overrides the service name reported in telemetry resources.
- `OTEL_EXPORTER_OTLP_ENDPOINT`: OTLP HTTP base URL. Default: `http://127.0.0.1:4318`
- `OTEL_METRIC_EXPORT_INTERVAL_MS`: metric export interval in milliseconds. Default: `10000`

## Local developer path

Use the local stack from [`docs/OBSERVABILITY.md`](./OBSERVABILITY.md):

1. Run `npm run dev:stack:up`.
2. Set `OTEL_ENABLED=true`.
3. Restart the application.
4. Query runtime signals with `npm run obs:query -- <metrics|logs|traces> "<query>"`.

## Why startup happens in `bin/www`

Instrumentation has to load before the application imports modules that may be patched by telemetry libraries. In this template, `bin/www` is the earliest stable bootstrap point for worker processes, so the stub is wired there instead of in `app.js`.

## Default behavior

- No traces or metrics are emitted unless `OTEL_ENABLED=true`.
- Existing request logging and runtime behavior stay unchanged unless `OTEL_ENABLED=true` is set.
