# Symphony setup

This repository includes a root `WORKFLOW.md` and a `scripts/symphony-bootstrap.sh` helper so it can be used with OpenAI Symphony.

## What Symphony expects

OpenAI's Symphony reference flow polls Linear for work, creates one workspace per issue, launches Codex in app-server mode inside that workspace, sends a workflow prompt, and keeps Codex working until the issue is done. It also expects the repository to provide a `WORKFLOW.md` file, and the Elixir reference implementation defaults to `./WORKFLOW.md` if no custom path is supplied.

## 1. Required environment variables

Set these before starting Symphony:

```sh
export LINEAR_API_KEY="<your-linear-personal-api-key>"
export SOURCE_REPO_URL="git@github.com:your-org/your-repo.git"
export SYMPHONY_WORKSPACE_ROOT="$HOME/code/symphony-workspaces"
export CODEX_BIN="codex"
```

`LINEAR_API_KEY` is the Linear personal token Symphony reads by default. `WORKFLOW.md` can also reference `$LINEAR_API_KEY`, `$SYMPHONY_WORKSPACE_ROOT`, and other environment-backed values.

## 2. Update `WORKFLOW.md`

Edit these values in the YAML front matter:

- `tracker.project_slug`: the Linear project slug
- `workspace.root`: the parent directory where Symphony should create per-issue workspaces
- `hooks.after_create`: normally keep the repo clone plus `bash scripts/symphony-bootstrap.sh`
- `codex.command`: the Codex executable and optional model flags you want Symphony to use
- `server.port`: optional dashboard port for the Symphony service

### Finding the Linear project slug

In Linear, open the project and copy the URL. The slug is the project segment in that URL.

## 3. Install and run Symphony

The public OpenAI Symphony repo currently ships an experimental Elixir reference implementation. Its documented startup flow is:

```sh
git clone https://github.com/openai/symphony
cd symphony/elixir
mise trust
mise install
mise exec -- mix setup
mise exec -- mix build
mise exec -- ./bin/symphony /absolute/path/to/your/repo/WORKFLOW.md --port 4100
```

If you omit the path, Symphony defaults to its local `./WORKFLOW.md`, so passing your repo's workflow path is the safest option.

## 4. Linear workflow statuses

OpenAI's reference README notes that its default workflow expects non-standard Linear statuses:

- `Rework`
- `Human Review`
- `Merging`

Add those in Linear Team Settings if you want to follow the reference flow closely. Otherwise, customize the workflow body and your Symphony setup to match your existing status model.

## 5. Recommended repo usage

- Keep `AGENTS.md` and `docs/` up to date.
- Use `docs/exec-plans/active/` for medium and large changes.
- Keep `scripts/worktree-bootstrap.sh` and `scripts/symphony-bootstrap.sh` deterministic.
- Let Symphony create one fresh workspace per issue.
- Avoid relying on shell aliases, personal dotfiles, or untracked local config inside workspaces.

## 6. Verification expectation

Your Symphony workflow already tells Codex to run:

```sh
npm run verify
```

Keep that command healthy and fast. It is your main repository-level guardrail during autonomous runs.

## 7. Optional skills

OpenAI's reference README says you can optionally copy `commit`, `push`, `pull`, `land`, and `linear` skills into your repo. This template does not ship those skills because they are optional and may depend on your exact workflow. Add them later under `.codex/skills/` if you decide to mirror the reference setup more closely.
