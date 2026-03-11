#!/usr/bin/env bash
set -euo pipefail

# Symphony creates a fresh workspace per issue. This script makes that workspace
# ready for Codex without depending on machine-specific shell state.

if command -v npm >/dev/null 2>&1; then
  npm ci || npm install
else
  echo "npm is required" >&2
  exit 1
fi

# Reuse the existing harness/bootstrap checks.
bash scripts/worktree-bootstrap.sh

# Additional lightweight signal for Symphony-specific runs.
echo "Symphony bootstrap complete."
