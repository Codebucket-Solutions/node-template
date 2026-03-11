---
tracker:
    kind: linear
    api_key: $LINEAR_API_KEY
    project_slug: "replace-with-your-linear-project-slug"
workspace:
    root: $SYMPHONY_WORKSPACE_ROOT
hooks:
    after_create: |
        git clone --depth 1 "$SOURCE_REPO_URL" .
        bash scripts/symphony-bootstrap.sh
agent:
    max_concurrent_agents: 5
    max_turns: 20
codex:
    command: "${CODEX_BIN:-codex} app-server"
    # approval_policy values depend on your Codex app-server version.
    # Common values documented by OpenAI include: untrusted, on-failure, on-request, never.
    approval_policy: on-request
    thread_sandbox: workspace-write
server:
    port: 4100
---

# Symphony workflow contract

You are working on a tracked issue in this repository.

## Read before making changes

1. `AGENTS.md`
2. `README.md`
3. `docs/README.md`
4. `docs/ARCHITECTURE.md`
5. `docs/WORKFLOW.md`
6. `docs/QUALITY.md`
7. The most relevant files under `docs/exec-plans/active/`

## Repository expectations

- Preserve all existing template behavior unless the issue explicitly requires otherwise.
- Prefer additive changes over replacements.
- Keep changes small, verifiable, and easy to review.
- Read files before editing them.
- Update docs when architecture, behavior, workflow, or developer setup changes.
- Run repository verification before finishing.

## Issue handling

- Treat the Linear issue identifier, title, and body as the task contract.
- If the issue is broad, create or update an execution plan under `docs/exec-plans/active/` before making large changes.
- If the issue is underspecified, choose the safest minimal implementation that still resolves the request.

## Verification

Before declaring the issue done, run:

```sh
npm run verify
```

If verification fails, either fix the issue or report the failure precisely with the command output and a concise explanation.

## Completion checklist

- Implementation completed.
- Docs updated when needed.
- Plan updated when used.
- Verification run.
- Final summary includes files changed, verification status, and any follow-up work.
