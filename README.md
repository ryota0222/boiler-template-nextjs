# nextjs-template

Next.js App Router template with Mantine and a shared UI package (`packages/ui`), wired for strict linting, accessibility testing, secret scanning, and supply chain protection out of the box.

## Requirements

- Node.js 24
- pnpm 10 (pinned via `packageManager`)
- [mise](https://mise.jdx.dev/) — provides gitleaks, shellcheck, shfmt, and codegraph
- [Docker](https://www.docker.com/) — runs PostgreSQL via Docker Compose for local development

## Quick Start

```bash
mise install
cp .env.example .env
pnpm install          # postinstall runs `prisma generate`
pnpm run db:up        # start PostgreSQL (waits for healthcheck)
pnpm run db:migrate   # apply migrations
pnpm run db:seed      # insert development data
codegraph init        # build the code index for the codegraph MCP server
pnpm dev
```

Open <http://localhost:3000>.

`pnpm install` runs `playwright install chromium` afterwards, which the Storybook accessibility tests and the end-to-end tests both need.

`codegraph init` indexes symbols, call paths, and impact into `.codegraph/`, which the codegraph MCP server (`.mcp.json`) hands to agents. The index is built per clone, kept out of git, and updated automatically as files change.

The app itself is not containerised for development — Next.js runs on the host because HMR is measurably faster there. `compose.yaml` starts PostgreSQL only.

## After Cloning This Template

Four things carry template defaults and need replacing before the project is yours.

| What                             | Where                           | Notes                                                                                              |
| -------------------------------- | ------------------------------- | -------------------------------------------------------------------------------------------------- |
| Package name                     | `package.json` `name`           |                                                                                                    |
| Application name and description | `src/app/layout.tsx` `metadata` | Page titles follow `「ページ名 \| アプリ名」`; the app name lives here only                        |
| Design baseline                  | `src/helpers/theme.ts`          | Accent color, radius, appearance, and voice & tone — set via `/setup-theme`                        |
| Favicon                          | `src/app/favicon.ico`           | Still the Next.js default — it renders as the Next.js logo, so a missed replacement ships silently |

The design baseline — **accent color, corner radius, appearance mode, and voice & tone** — is decided before any UI work. Run `/setup-theme` in Claude Code; it asks four impression-based questions, turns the accent into a ten-step scale with `pnpm --filter @template/ui run generate-accent-colors '<#rrggbb>'`, and writes `src/helpers/theme.ts`:

```typescript
export const themeConfig = {
  accentColors: ['#f0edff', '#dcd8fa', /* … ten steps … */ '#281f94'],
  accentShade: 6,
  appearance: 'light',
  fontFamily: '…',
  fontFamilyMonospace: '…',
  isConfigured: true,
  radius: 'md',
  voiceAndTone: 'friendly',
} as const satisfies ThemeConfig;
```

`UiProvider` from `@template/ui` applies the theme in both the app and Storybook, together with the text-colour overrides that keep secondary text and error messages readable; `voiceAndTone` guides UI copy only. Until `isConfigured` is `true`, a Claude Code hook blocks edits to `src/` (except `theme.ts`), so implementation never starts on undecided styling.

## Project Structure

```text
src/
  app/                  # App Router convention files and Route Handlers
  api/                  # Endpoint definitions and TanStack Query options
  controllers/          # Request handlers (composition root)
  usecases/             # Business logic
  gateways/             # Server-side I/O (DB, external services)
  presenters/           # Usecase results → HTTP responses
  features/             # Domain-specific UI components
  shared-components/    # Domain-independent reusable UI parts
  entities/             # Type definitions & zod schemas
  helpers/              # Shared utilities & library configuration
  stores/               # Client UI state (Zustand)
generators/             # Tests for the code generators
plop-templates/         # Templates the generators write from
plopfile.ts             # Code generators (`pnpm run generate`)
packages/
  ui/                   # @template/ui: Mantine theme, UiProvider, test helpers, shared blocks
prisma/
  schema.prisma         # Database schema
  migrations/           # Migration history
  seed.ts               # Development seed data
```

Mantine components are imported directly rather than wrapped. Screens that repeat a shape — a page header, an empty state, an error banner, a data table — use the blocks in `packages/ui` instead of rebuilding them. `packages/ui` is a copy of prototalk-enterprise's package without its CSV and authentication parts; see [.claude/rules/ui-blocks.md](./.claude/rules/ui-blocks.md).

Layer boundaries are enforced by dependency-cruiser, not convention alone. See [AGENTS.md](./AGENTS.md) for the full rules.

## Removing the Todo Reference Implementation

`Todo` is a working reference implementation of every layer — a list (GET), an add form (POST), and a completion toggle (PATCH) with an optimistic update, from the screen through route → controller → usecase → gateway to PostgreSQL — not a required feature.

Delete it once its purpose — showing the pattern end to end — has been served, by removing all of its locations:

- The `Todo` model in `prisma/schema.prisma`, plus a follow-up migration (`pnpm run db:migrate`)
- `src/entities/todo.ts` and `src/entities/todo.test.ts`
- `src/api/todo/`
- `src/app/api/todos/`
- `src/controllers/todoController.ts` and `src/controllers/todoController.test.ts`
- `src/usecases/todo/`
- `src/gateways/todoGateway.ts` and `src/gateways/todoGateway.db.test.ts`
- `src/features/todo-list/`, and the `<TodoList />` in `src/app/page.tsx`
- `e2e/todo.test.ts`, and the Todo locators and actions in `e2e/models/homePage.ts`
- `prisma/seed.ts`, its `migrations.seed` entry in `prisma.config.ts`, and its entry in `package.json`'s `knip.workspaces["."].entry` — once `Todo` is gone there is nothing left to seed; add all three back when your own schema needs seed data

Keep the shared parts every endpoint uses: `src/api/endpoint.ts`, `src/api/client.ts`, `src/usecases/api-request/`, `src/gateways/requestInputGateway.ts`, `src/gateways/errorLogGateway.ts`, `src/gateways/prismaClient.ts`, `src/presenters/apiResponsePresenter.ts`, `src/entities/apiFailure.ts`, and `src/entities/result.ts`.

## Scripts

### Development

| Command          | Purpose                                                                                                                                                                     |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm dev`       | Development server (Turbopack)                                                                                                                                              |
| `pnpm build`     | Production build                                                                                                                                                            |
| `pnpm start`     | Runs `next start` — Next 16 warns this ignores `output: 'standalone'`; run `node .next/standalone/server.js` after `pnpm build` instead (see `Dockerfile`'s `runner` stage) |
| `pnpm storybook` | Storybook on port 6006                                                                                                                                                      |

### Testing

| Command                | Purpose                                                                   |
| ---------------------- | ------------------------------------------------------------------------- |
| `pnpm test`            | Unit tests and Storybook accessibility tests (no database required)       |
| `pnpm test:db`         | Gateway tests against a real PostgreSQL instance (`pnpm run db:up` first) |
| `pnpm test:generators` | Runs every code generator on a copy of the project and checks the output  |
| `pnpm test:coverage`   | Same as `pnpm test`, with coverage (no database required)                 |
| `pnpm e2e`             | Playwright end-to-end tests                                               |

### Code Generators

| Command                                                                                                    | Purpose                                                                                                                    |
| ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `pnpm run generate api -- --concept inventory-item --action list --method GET --path /api/inventory-items` | Endpoint definition, controller, Route Handler, usecase operation, and tests                                               |
| `pnpm run generate screen -- --concept inventory-item --kind collection --path /inventory-items`           | Page, feature component, query or mutation options, stories, and tests (`--kind`: `blank`, `collection`, `detail`, `form`) |

Run without arguments in a terminal to be asked for each one. The `add-web-api-endpoint` and `add-web-screen` skills in `.claude/skills/` describe every argument.

### Database

| Command                | Purpose                                                                                                                                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm run db:up`       | Start PostgreSQL via Docker Compose (waits for healthcheck)                                                                                                                                       |
| `pnpm run db:down`     | Stop the PostgreSQL container                                                                                                                                                                     |
| `pnpm run db:migrate`  | Apply migrations in development (`prisma migrate dev`)                                                                                                                                            |
| `pnpm run db:generate` | Regenerate the Prisma Client (`prisma generate`) — required after every `pnpm run db:migrate`; Prisma 7's `migrate dev` no longer runs generators, despite its `--help` text still saying it does |
| `pnpm run db:deploy`   | Apply existing migrations without generating new ones (`prisma migrate deploy`, used in CI/production)                                                                                            |
| `pnpm run db:reset`    | Reset the database (`prisma migrate reset`) — Prisma 7 requires interactive user consent when it detects an AI agent, so use `pnpm run db:seed` instead for agent-driven verification             |
| `pnpm run db:seed`     | Insert development seed data (`prisma db seed`) — not idempotent; `createMany` has no unique key, so re-running it accumulates duplicate rows                                                     |
| `pnpm run db:studio`   | Open Prisma Studio                                                                                                                                                                                |

### Checks

| Command                | Purpose                                        |
| ---------------------- | ---------------------------------------------- |
| `pnpm lint`            | ESLint over `src/` and `.storybook/`           |
| `pnpm typecheck`       | `tsc --noEmit`                                 |
| `pnpm format`          | Prettier                                       |
| `pnpm lint:md`         | markdownlint                                   |
| `pnpm lint:text`       | textlint — Japanese terminology, per `prh.yml` |
| `pnpm lint:actions`    | actionlint over GitHub Actions workflows       |
| `pnpm lint:sh`         | shellcheck over tracked shell scripts          |
| `pnpm knip`            | Unused files, exports, and dependencies        |
| `pnpm depcruise`       | Layer dependency rules                         |
| `pnpm scan:secretlint` | Secret scanning                                |
| `pnpm scan:gitleaks`   | Secret scanning over git history               |

`lint:actions`, `lint:sh`, and `scan:gitleaks` run tools provided by mise rather than npm, so `mise install` must have been run first.

## Accessibility Gate

Storybook stories — in `src/` and in `packages/ui` — are rendered in Chromium and checked by axe-core; `serious` and `critical` violations fail `pnpm test`, and text contrast is measured at 3:1. A component state without a story is never checked, so [.claude/rules/stories.md](./.claude/rules/stories.md) lists which states need one.

Page-level properties such as the page title and `lang` are checked by the e2e tests: every page an e2e test visits runs axe through `e2e/helpers/accessibilityChecking.ts` with the same settings.

## Supply Chain Protection

`.npmrc` points pnpm at Takumi Guard, an npm registry proxy that blocks known-malicious packages before their tarballs are downloaded. It applies to local installs, Docker builds, and CI alike, and needs no account or token. Deleting `.npmrc` returns installs to `registry.npmjs.org` unprotected.

Only npm packages are covered — the Chromium and Prisma engine binaries fetched during `postinstall` come from their own CDNs.

## Documentation

- [AGENTS.md](./AGENTS.md) — architecture, state management, and tooling, written for LLM agents but accurate for humans
- [.claude/rules/](./.claude/rules/) — coding standards, UI design rules, and testing conventions
- [docs/rules/](./docs/rules/) — dependency policy and implementation patterns
