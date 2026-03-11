# Codex App Setup

This repository is prepared for Codex app, Codex IDE extension, and Codex CLI workflows.

## 1. Trust the repository

Open the repository in Codex and trust the project so `.codex/config.toml` is loaded.

## 2. Create a local environment

In the Codex app settings for this project, create a local environment and set the setup script to:

```sh
npm ci || npm install
npm run worktree:bootstrap
```

OpenAI documents that local environments can define setup steps for worktrees and common project actions, and that this configuration is stored inside the `.codex` folder at the repo root. citeturn337372search0turn993475view0turn993475view1

## 3. Add project actions

Recommended actions:

- Verify -> `npm run verify`
- Start dev server -> `npm run start:dev`
- Validate docs -> `npm run docs:validate`
- Score quality -> `npm run quality:score`
- New plan -> `npm run plan:new -- --slug=<slug> --title="<title>"`

The Codex app exposes actions in the top bar and runs them in the integrated terminal. citeturn993475view0

## 4. Use worktrees for isolated tasks

Codex app supports independent worktrees so multiple tasks do not interfere with each other. citeturn337372search2

Suggested pattern:

```sh
git worktree add ../wt-task-name -b task/name
cd ../wt-task-name
npm run worktree:bootstrap
```

## 5. Use AGENTS.md as the entry point

Codex reads `AGENTS.md` files before doing work, so keep high-level guidance there and detailed guidance in `docs/`. citeturn337372search1
