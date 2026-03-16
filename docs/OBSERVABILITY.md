# Observability

This template includes an additive local observability harness for backend work:

- optional OpenTelemetry startup instrumentation in `instrumentation/opentelemetry.js`,
- a local developer stack in `docker-compose.dev.yml`,
- deterministic worktree defaults in `.env.worktree`,
- and a terminal query helper in `scripts/query-observability.js`.

## Local stack

Start the local stack with:

```sh
npm run worktree:bootstrap
npm run dev:stack:up
```

This starts a worktree-local stack. The exact host ports are written to `.env.worktree` so multiple worktrees can run side by side without reusing the same fixed port bindings.

The generated worktree values include:

- `DB_PORT`
- `REDIS_PORT`
- `GRAFANA_PORT`
- `LOKI_PORT`
- `TEMPO_PORT`
- `OTLP_GRPC_PORT`
- `OTLP_HTTP_PORT`
- `PROMETHEUS_PORT`
- `COMPOSE_PROJECT_NAME`

Stop it with:

```sh
npm run dev:stack:down
```

## Worktree defaults

`npm run worktree:bootstrap` creates `.env.worktree` if it does not already exist.

That file gives each worktree:

- a deterministic `PORT`,
- a worktree-local `COMPOSE_PROJECT_NAME`,
- worktree-local service ports for MySQL, Redis, and observability,
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
