# Quality

## Baseline checks

- ESLint
- Prettier formatting check
- Documentation validation
- Lightweight repository quality score generation

## Standard command

```sh
npm run verify
```

## Quality goals

- Small diffs over broad rewrites
- Update docs when behavior or architecture changes
- Keep instructions discoverable from the repo root
- Ensure worktree setup is deterministic

## Output artifacts

- `docs/references/quality-score.json`
