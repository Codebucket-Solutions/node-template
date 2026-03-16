# Observability

This template includes an additive local observability harness for backend work:

- optional OpenTelemetry startup instrumentation in `instrumentation/opentelemetry.js`,
- a local developer stack in `docker-compose.dev.yml`,
- deterministic worktree defaults in `.env.worktree`,
- and a terminal query helper in `scripts/query-observability.js`.

## Local stack

Start the local stack with:

```sh
npm run dev:stack:up
```

This starts:

- MySQL on `127.0.0.1:3306`
- Redis on `127.0.0.1:6379`
- Grafana LGTM on:
    - Grafana: `http://127.0.0.1:3001`
    - Loki: `http://127.0.0.1:3100`
    - Tempo: `http://127.0.0.1:3200`
    - OTLP gRPC: `127.0.0.1:4317`
    - OTLP HTTP: `127.0.0.1:4318`
    - Prometheus API: `http://127.0.0.1:9090`

Stop it with:

```sh
npm run dev:stack:down
```

## Worktree defaults

`npm run worktree:bootstrap` creates `.env.worktree` if it does not already exist.

That file gives each worktree:

- a deterministic `PORT`,
- a unique `OTEL_SERVICE_NAME`,
- default local URLs for Loki, Prometheus, Tempo, and OTLP,
- and a startup smoke-test budget.

The generated file is local-only and should stay uncommitted.

## Enable telemetry

Telemetry is disabled by default so the template still runs in minimal environments.

To enable traces and metrics in a worktree:

1. Start the local stack with `npm run dev:stack:up`.
2. Set `OTEL_ENABLED=true` in `.env.worktree` or `.env.local`.
3. Restart the server.

To send structured application logs to Loki as well:

1. Set `LOKI_ENABLED=true`.
2. Keep `LOKI_URL=http://127.0.0.1:3100`.

## Query from the terminal

Use:

```sh
npm run obs:query -- <metrics|logs|traces> "<query>"
```

Examples:

```sh
npm run obs:query -- metrics "up"
npm run obs:query -- logs "{application=\"node-template\"}"
npm run obs:query -- traces "{ resource.service.name = \"node-template\" }"
```

The query helper is intended for Codex and human developers working from the terminal. It prints the raw API payload as formatted JSON.

## Related files

- `instrumentation/opentelemetry.js`
- `utils/logger.js`
- `docker-compose.dev.yml`
- `scripts/query-observability.js`
- `scripts/smoke-server.js`
