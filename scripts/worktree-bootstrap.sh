#!/usr/bin/env bash
set -euo pipefail

if command -v npm >/dev/null 2>&1; then
  npm ci || npm install
else
  echo "npm is required" >&2
  exit 1
fi

if npm run | grep -q " lint"; then
  npm run lint || true
fi

if npm run | grep -q " format:check"; then
  npm run format:check || true
fi

node scripts/validate-docs.js
node scripts/score-quality.js

echo "Worktree bootstrap complete."
