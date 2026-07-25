---
description: Configuration files that enforce commit/secret-scanning gates and must not be edited by agents directly
paths: ['lefthook.yml', '.secretlintrc.json']
---

# Protected Files

These files enforce the repository's commit, lint, and secret-scanning gates. Editing them to make a failing hook or a scan error go away silently removes the protection the gate exists to provide. Do not edit them directly. When a change is genuinely needed, describe the required change and ask the user to apply it manually.

## lefthook.yml

Orchestrates the `pre-commit`, `commit-msg`, and `pre-push` git hooks (lint, format, typecheck, tests, gitleaks). Do not edit directly.

## .secretlintrc.json

Defines the secretlint ruleset used by the secret-scanning hooks. For a false positive, add a `.secretlintignore` entry instead of loosening this ruleset. Do not edit directly.
