# Agent Guidelines

This file provides guidance to LLM agents when working with code in this repository.

## Project Overview

Next.js App Router web application template for Node.js 24 / ESM. Uses Radix Themes for styling.

## Database Setup

The template assumes PostgreSQL. Docker Compose runs it for local development and CI; production is a container deployment.

```bash
cp .env.example .env
pnpm install          # postinstall runs `prisma generate`
pnpm run db:up        # start PostgreSQL (waits for healthcheck)
pnpm run db:migrate   # apply migrations
pnpm run db:seed      # insert development data
pnpm dev
```

Creating `.env` (the first line above) is a human step: an agent's permissions deny both running `cp .env.example .env` and reading `.env.example`, so an agent cannot discover the connection strings that way. Two variables matter:

- `DATABASE_URL` — the connection string the app and `prisma migrate` / `prisma generate` use, e.g. `postgresql://postgres:postgres@localhost:5432/app`
- `DATABASE_URL_TEST` — the connection string `pnpm run test:db` (the `db` Vitest project) uses, e.g. `postgresql://postgres:postgres@localhost:5432/app_test`

When a task needs them, export both inline instead of touching `.env`:

```bash
export DATABASE_URL='postgresql://postgres:postgres@localhost:5432/app'
export DATABASE_URL_TEST='postgresql://postgres:postgres@localhost:5432/app_test'
```

The app itself is not containerised for development — Next.js runs on the host because HMR is measurably faster there. `compose.yaml` starts PostgreSQL only.

`PrismaClient` lives in `src/gateways/prismaClient.ts`, not `src/helpers/`. A client typed with the application's own schema is not domain-independent, so `docs/rules/dependency-policy.md` places it in `gateways/`.

### Schema changes require a generate step

Prisma 7's `migrate dev` no longer runs generators, even though `prisma migrate dev --help` still describes it as triggering them — that help text is stale. Editing `prisma/schema.prisma` and running only `pnpm run db:migrate` leaves `prisma/generated/` stale, so `pnpm typecheck` fails with errors like `Property 'x' does not exist on type 'PrismaClient'` and no hint why. Always chain a generate step after a schema change:

```bash
# 1. edit prisma/schema.prisma
pnpm run db:migrate
pnpm run db:generate
```

### Tests that need the database

| Command        | Projects                              | Database     |
| -------------- | ------------------------------------- | ------------ |
| `pnpm test`    | `unit`, `storybook`                   | not required |
| `pnpm test:db` | `db` (`src/gateways/**/*.db.test.ts`) | required     |

The `PostToolUse` hook runs `pnpm test` — the project-scoped command above — so the everyday edit loop never needs Docker. The pre-push git hook is different: `lefthook.yml` still runs an unqualified `pnpm exec vitest run`, which selects all three Vitest projects including `db`, so pushing currently does require Docker. This is a known pending fix — `lefthook.yml` is a protected file, tracked separately for a human to change to `pnpm run test`. CI runs the database-backed suite in its own job (`pnpm run test:db`), with Postgres provisioned there.

`docker/initdb/01-create-test-db.sql`, which creates `app_test`, only runs the first time the Postgres volume is created. `pnpm run db:down` stops the container but keeps that volume, so recreating `app_test` from scratch needs `docker compose down -v` before the next `pnpm run db:up`.

### Migrations in production

The `migrator` image bakes Prisma's schema engine directly into its layers, so the deploy job needs no outbound network access beyond reaching the database itself. That engine binary, however, is compiled for whichever architecture built the image, not the one it eventually runs on — building on Apple Silicon and deploying to an x86_64 host requires an explicit `docker build --platform linux/amd64`, or the migrator container ships a binary the deploy target cannot execute.

Never run migrations on container start. Cloud Run and ECS start several instances at once, and concurrent `migrate deploy` calls contend for the same schema. Run the `migrator` build target as a one-shot job before rolling out the app.

### Agents and `prisma migrate reset`

Prisma 7 detects when it is being driven by an AI agent and refuses to run `prisma migrate reset` without explicit interactive user consent. This is a deliberate safety guard against an agent silently wiping a database, not a bug to route around — when an agent needs to verify a change against a clean state, `pnpm run db:seed` is the command to reach for instead of a reset.

## Design System Setup (run before any implementation)

Before any `src/` implementation, the design baseline must be decided: **accent color, corner radius, appearance mode, and voice & tone**. Until it is, a `PreToolUse` hook (`require-theme-setup.sh`) blocks Edit/Write to `src/` (except `src/helpers/theme.ts`).

- Decide it with the `/setup-theme` command, which asks four impression-based questions and writes `src/helpers/theme.ts`.
- The gate releases when `themeConfig.isConfigured` becomes `true`.
- `src/helpers/theme.ts` is the single source of truth: `accentColor`, `radius`, and `appearance` are passed to Radix `<Theme>`; `voiceAndTone` is a recorded decision that guides UI copy (`.claude/rules/design-copy.md`) and has no runtime effect.
- `.claude/.template-dev` disables the gate for maintaining this template itself; it is not distributed to projects scaffolded from the template.

## Screen Design Rules

Before adding or changing a screen in `src/app/` or a component in `src/features/` or `src/shared-components/`, read the rule files in `.claude/rules/` that cover what you are changing.

| File                   | The question it answers                                                     |
| ---------------------- | --------------------------------------------------------------------------- |
| `design-ooui.md`       | What object does this screen operate on, and where does it sit in the menu  |
| `design-layout.md`     | Where do things sit, and which spacing, type, colour, and icon tokens apply |
| `design-hierarchy.md`  | Which of several operable elements comes first, and how are they grouped    |
| `design-affordance.md` | Can the user tell there is anything to press at all                         |
| `design-collection.md` | How is a list searched, sorted, paged, and acted on in bulk                 |
| `design-form.md`       | When is submit enabled, and how are inputs validated, hinted, and hidden    |
| `design-feedback.md`   | How does the system answer — toast, banner, loading, dialog                 |
| `design-copy.md`       | What do the words say                                                       |
| `design-states.md`     | Which states must the screen cover, and under which content conditions      |
| `design-a11y.md`       | Can it be operated without a mouse or perfect vision                        |

One concept has one home. A rule is stated in the file that owns it; other files point at it and must not restate it. Decided values (pagination sizes, the type scale, contrast steps) live in the owning file, not in a summary.

Radix Themes owns the token scales and the accessible behaviour of its components. These files cover what it leaves to the author — which token to reach for, and the decisions it has no opinion about.

## Directory Structure

```text
src/
  app/                  # App Router (layout.tsx, page.tsx, loading.tsx, error.tsx, etc.)
  features/             # Domain-specific UI components (organized by feature subdirectories)
  shared-components/    # Domain-independent reusable UI parts
  entities/             # Type definitions & zod schemas (domain models)
  gateways/             # I/O with external data sources (API, DB, CSV, etc.)
  presenters/           # Display formatting functions (data → display-ready transformation)
  helpers/              # Shared utilities & library configuration (e.g. axios, dayjs)
  stores/               # Client UI state shared across the tree (Zustand)
prisma/
  schema.prisma         # Database schema
  migrations/           # Migration history (generated by `prisma migrate dev`)
  seed.ts               # Development seed data
  generated/            # Prisma Client (gitignored, produced by `prisma generate`)
```

- `app/` contains Next.js App Router convention files (layout, page, loading, error, not-found)
- `features/` contains domain-specific UI components, organized by feature subdirectories
- `shared-components/` contains domain-independent reusable UI parts shared across features
- `entities/` contains only data structure definitions (no logic)
- `gateways/` handles I/O with external data sources, organized by concern into subdirectories, and owns the query keys, `queryOptions`, and `mutationOptions` for that data
- `presenters/` contains display formatting functions that transform data into display-ready format
- `helpers/` contains shared utilities and library configurations (e.g. axios, dayjs)
- `stores/` contains Zustand stores for client UI state that must be shared across the component tree
- Test files are co-located with their source files (`foo.ts` → `foo.test.ts`, `Foo.tsx` → `foo.test.tsx`)

Radix Themes components are used directly, with no wrapper components written around them. Wrapping every component would force per-component build work before the template is usable, which defeats the point of a ready-to-use template.

Some entries in `knip.ignoreDependencies` cover a dependency knip cannot see is used, rather than one that genuinely has no consumer yet:

- `lucide-react` is retained as the icon library because Radix Themes does not ship icons; it is listed until the first component imports it.
- `@prisma/client` is retained because the generated client (`prisma/generated/`, gitignored) imports it directly — e.g. `import * as runtime from '@prisma/client/runtime/client'` — and knip honours `.gitignore` by default, so it never sees that import site.

`zod` is a different case: it is genuinely imported today, by `src/entities/todo.ts`. It is listed pre-emptively because that is `zod`'s only consumer, and deleting the `Todo` reference implementation (see `README.md`) removes it — without this entry, `pnpm knip` would break for anyone who follows that README section. `zod` stays the schema validation library the `entities/` convention expects for whatever entity is added next.

## State Management

State is split across three tools by origin, not by convenience.

| State                                  | Tool           | Location                                                    |
| -------------------------------------- | -------------- | ----------------------------------------------------------- |
| Server state (API, DB, CSV)            | TanStack Query | `gateways/<domain>/<domain>Query.ts`, `<domain>Mutation.ts` |
| Client UI state shared across the tree | Zustand        | `stores/<name>/`                                            |
| Client UI state local to one component | `useState`     | The component itself                                        |

Mutations default to optimistic updates, subject to strict preconditions. `useOptimistic` is not used for server state: its optimistic value is local to the component that calls the hook, so sharing it across the tree would require lifting state and converting large subtrees into Client Components.

The full rules — the mandatory four-step optimistic update, the three preconditions, the forbidden operations, and the verified type-level constraints — are in `.claude/rules/state-management.md`. See also `.claude/rules/gateways.md` and `.claude/rules/stores.md`.

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

| Mechanism                                                         | Scope                                                                                    |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `a11y.test: 'error'` in `.storybook/preview.tsx`                  | Turns axe violations into test failures                                                  |
| `storybook` project in `vitest.config.ts` (Playwright + Chromium) | Renders every story on `pnpm test`                                                       |
| `PostToolUse` hook -> `lint-and-test.sh`                          | Runs `vitest run --project unit --project storybook` after every file Claude Code writes |

Coverage comes entirely from stories, so a component state with no story is never checked. See `.claude/rules/design-states.md` for which states require a story.

The template ships with no stories, because Radix Themes components are consumed directly rather than wrapped. Until the first `.stories.tsx` is added the gate has nothing to inspect and `pnpm test` passes on `passWithNoTests`. The first story you write is also the first thing this gate ever checks.

There is no static (lint-time) a11y check. `eslint-plugin-jsx-a11y` was evaluated and rejected because its latest release does not declare ESLint 10 support and it adds roughly 106 transitive packages. Reconsider it, or oxlint as a complement, before adding a11y rules to `eslint.config.ts`.

## Subagent Workflow

PostToolUse hooks (lint, test) do not run inside subagents. After each subagent task completes, the main session MUST run verification before committing:

1. Subagent reports task complete
2. Main session: `pnpm lint`
3. Main session: `pnpm test`
4. If the task touched `src/gateways/`: also run `pnpm test:db` (requires Docker — `pnpm run db:up` first). `pnpm test` excludes the `db` Vitest project, so it does not cover gateway changes on its own.
5. Fix any errors found
6. Commit

Do NOT batch verification to the end — check after every task.
