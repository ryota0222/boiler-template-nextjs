# Agent Guidelines

This file provides guidance to LLM agents when working with code in this repository.

## Project Overview

Next.js App Router web application template for Node.js v22+ / ESM. Uses Tailwind CSS and shadcn/ui for styling.

## Directory Structure

```text
src/
  app/                  # App Router (layout.tsx, page.tsx, loading.tsx, error.tsx, etc.)
  features/             # Domain-specific UI components (organized by feature subdirectories)
  shared-components/    # Domain-independent reusable UI parts
    shadcn/             # shadcn/ui components (managed by shadcn CLI)
  entities/             # Type definitions & zod schemas (domain models)
  gateways/             # I/O with external data sources (API, DB, CSV, etc.)
  presenters/           # Display formatting functions (data → display-ready transformation)
  helpers/                 # Implementation (organized by feature subdirectories)
```

- `app/` contains Next.js App Router convention files (layout, page, loading, error, not-found)
- `features/` contains domain-specific UI components, organized by feature subdirectories
- `shared-components/shadcn/` contains shadcn/ui components (managed by shadcn CLI)
- `shared-components/` (non-ui) contains domain-independent reusable UI parts shared across features
- `entities/` contains only data structure definitions (no logic)
- `gateways/` handles I/O with external data sources, organized by concern into subdirectories
- `presenters/` contains display formatting functions that transform data into display-ready format
- `helpers/` contains shared utilities and library configurations (e.g. axios, dayjs)
- Test files are co-located with their source files (`foo.ts` → `foo.test.ts`, `Foo.tsx` → `foo.test.tsx`)

## Git Branch Naming

- Feature branches: `feature/<kebab-case-name>` (e.g. `feature/supabase-integration`)
- Bug fix branches: `fix/<kebab-case-name>` (e.g. `fix/login-redirect`)
- Chore branches: `chore/<kebab-case-name>` (e.g. `chore/update-dependencies`)

## Information Sources

When answering questions about libraries, frameworks, SDKs, APIs, CLI tools, or cloud services, always consult official documentation or up-to-date sources before responding — even for well-known tools. Do not rely solely on training data.

- Use the context7 MCP (`resolve-library-id` → `query-docs`) to fetch official docs
- Use WebSearch or WebFetch to check official sites, GitHub, or release notes
- This applies especially to version-specific behavior, configuration options, and API signatures

## Secret Scanning & Shell Linting

This repository runs a defense-in-depth setup to keep secrets (API keys, webhook URLs, private keys, etc.) out of the codebase, plus lint/format for shell scripts.

| Layer | Mechanism                                                     | Scope                                           |
| ----- | ------------------------------------------------------------- | ----------------------------------------------- |
| L1    | `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB` in `.claude/settings.json` | Strips credentials from subprocess environments |
| L2    | `UserPromptSubmit` hook -> secretlint                         | Prompt text                                     |
| L3    | `PostToolUse` hook -> secretlint                              | Files written by Claude Code                    |
| L4    | lefthook + `PreToolUse` hook -> gitleaks                      | Staged files and git history                    |
| L5    | `run-ci.yaml` jobs                                            | The whole repository on push / pull_request     |

- secretlint is configured in `.secretlintrc.json`; run it with `pnpm run scan:secretlint`.
- gitleaks, shellcheck, and shfmt are installed via `mise` (`.mise.toml`).
- Shell scripts are linted with `pnpm run lint:sh` (shellcheck) and `pnpm run format:sh` (shfmt); `pnpm run format:sh:fix` applies formatting.
- For secret-scan false positives, add an allowlist to `.gitleaks.toml` (gitleaks) or a `.secretlintignore` file (secretlint). Neither file exists by default.

## Accessibility Gate

Storybook stories are checked by axe-core, and violations fail the test suite.

| Mechanism                                                         | Scope                                                 |
| ----------------------------------------------------------------- | ----------------------------------------------------- |
| `a11y.test: 'error'` in `.storybook/preview.ts`                   | Turns axe violations into test failures               |
| `storybook` project in `vitest.config.ts` (Playwright + Chromium) | Renders every story on `pnpm test`                    |
| `PostToolUse` hook -> `lint-and-test.sh`                          | Runs `vitest run` after every file Claude Code writes |

Coverage comes entirely from stories, so a component state with no story is never checked. See `.claude/rules/design-states.md` for which states require a story.

There is no static (lint-time) a11y check. `eslint-plugin-jsx-a11y` was evaluated and rejected because its latest release does not declare ESLint 10 support and it adds roughly 106 transitive packages. Reconsider it, or oxlint as a complement, before adding a11y rules to `eslint.config.ts`.

## Subagent Workflow

PostToolUse hooks (lint, test) do not run inside subagents. After each subagent task completes, the main session MUST run verification before committing:

1. Subagent reports task complete
2. Main session: `pnpm lint`
3. Main session: `pnpm test`
4. Fix any errors found
5. Commit

Do NOT batch verification to the end — check after every task.
