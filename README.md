# nextjs-template

Next.js App Router template with Radix Themes, wired for strict linting, accessibility testing, and secret scanning out of the box.

## Requirements

- Node.js 24
- pnpm 10 (pinned via `packageManager`)
- [mise](https://mise.jdx.dev/) — provides gitleaks, shellcheck, and shfmt
- [Docker](https://www.docker.com/) — runs PostgreSQL via Docker Compose for local development

## Quick Start

```bash
mise install
cp .env.example .env
pnpm install          # postinstall runs `prisma generate`
pnpm run db:up        # start PostgreSQL (waits for healthcheck)
pnpm run db:migrate   # apply migrations
pnpm run db:seed      # insert development data
pnpm dev
```

Open <http://localhost:3000>.

`pnpm install` runs `playwright install chromium` afterwards, which the Storybook accessibility tests and the end-to-end tests both need.

The app itself is not containerised for development — Next.js runs on the host because HMR is measurably faster there. `compose.yaml` starts PostgreSQL only.

## After Cloning This Template

Four things carry template defaults and need replacing before the project is yours.

| What                             | Where                           | Notes                                                                                              |
| -------------------------------- | ------------------------------- | -------------------------------------------------------------------------------------------------- |
| Package name                     | `package.json` `name`           |                                                                                                    |
| Application name and description | `src/app/layout.tsx` `metadata` | Page titles follow `「ページ名 \| アプリ名」`; the app name lives here only                        |
| Design baseline                  | `src/helpers/theme.ts`          | Accent color, radius, appearance, and voice & tone — set via `/setup-theme`                        |
| Favicon                          | `src/app/favicon.ico`           | Still the Next.js default — it renders as the Next.js logo, so a missed replacement ships silently |

The design baseline — **accent color, corner radius, appearance mode, and voice & tone** — is decided before any UI work. Run `/setup-theme` in Claude Code; it asks four impression-based questions and writes `src/helpers/theme.ts`:

```typescript
export const themeConfig = {
  accentColor: 'jade',
  appearance: 'light',
  isConfigured: true,
  radius: 'medium',
  voiceAndTone: 'friendly',
} as const;
```

`accentColor` (any [Radix color](https://www.radix-ui.com/colors)), `radius`, and `appearance` are applied to Radix `<Theme>` in both the app and Storybook; `voiceAndTone` guides UI copy only. Until `isConfigured` is `true`, a Claude Code hook blocks edits to `src/` (except `theme.ts`), so implementation never starts on undecided styling.

## Project Structure

```text
src/
  app/                  # App Router convention files
  features/             # Domain-specific UI components
  shared-components/    # Domain-independent reusable UI parts
  entities/             # Type definitions & zod schemas
  gateways/             # I/O with external data sources
  presenters/           # Display formatting functions
  helpers/              # Shared utilities & library configuration
  stores/               # Client UI state (Zustand)
prisma/
  schema.prisma         # Database schema
  migrations/           # Migration history
  seed.ts               # Development seed data
```

Radix Themes components are imported directly rather than wrapped, so the template is usable immediately without per-component setup work.

Layer boundaries are enforced by dependency-cruiser, not convention alone. See [AGENTS.md](./AGENTS.md) for the full rules.

## Removing the Todo Reference Implementation

`Todo` is a working reference implementation of the gateway and entity pattern (I/O plus zod validation), not a required feature. It does not include `todoQuery.ts` / `todoMutation.ts` — see [.claude/rules/state-management.md](./.claude/rules/state-management.md) and [.claude/rules/gateways.md](./.claude/rules/gateways.md) for how those fit in once your own gateway needs them.

Delete it once its purpose — showing the pattern end to end — has been served, by removing all of its locations:

- The `Todo` model in `prisma/schema.prisma`, plus a follow-up migration (`pnpm run db:migrate`)
- `src/entities/todo/`
- `src/gateways/todo/`
- `prisma/seed.ts`, its `migrations.seed` entry in `prisma.config.ts`, and its entry in `package.json`'s `knip.entry` — once `Todo` is gone there is nothing left to seed; add all three back when your own schema needs seed data

`zod` loses its only consumer once `src/entities/todo/` is gone, but `package.json` already lists it in `knip.ignoreDependencies` for exactly this reason (see AGENTS.md), so `pnpm knip` stays green without any extra step.

## Scripts

### Development

| Command          | Purpose                                                                                                                                                                     |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm dev`       | Development server (Turbopack)                                                                                                                                              |
| `pnpm build`     | Production build                                                                                                                                                            |
| `pnpm start`     | Runs `next start` — Next 16 warns this ignores `output: 'standalone'`; run `node .next/standalone/server.js` after `pnpm build` instead (see `Dockerfile`'s `runner` stage) |
| `pnpm storybook` | Storybook on port 6006                                                                                                                                                      |

### Testing

| Command              | Purpose                                                                   |
| -------------------- | ------------------------------------------------------------------------- |
| `pnpm test`          | Unit tests and Storybook accessibility tests (no database required)       |
| `pnpm test:db`       | Gateway tests against a real PostgreSQL instance (`pnpm run db:up` first) |
| `pnpm test:coverage` | Same as `pnpm test`, with coverage (no database required)                 |
| `pnpm e2e`           | Playwright end-to-end tests                                               |

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

Storybook stories are rendered in Chromium and checked by axe-core; violations fail `pnpm test`. Coverage comes entirely from stories, so a component state without a story is never checked.

The template ships with no stories. Until the first `.stories.tsx` exists the gate has nothing to inspect, and `pnpm test` passes on `passWithNoTests`.

## Documentation

- [AGENTS.md](./AGENTS.md) — architecture, state management, and tooling, written for LLM agents but accurate for humans
- [.claude/rules/](./.claude/rules/) — coding standards, UI design rules, and testing conventions
- [docs/rules/](./docs/rules/) — dependency policy and implementation patterns
