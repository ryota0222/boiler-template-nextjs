# nextjs-template

Next.js App Router template with Radix Themes, wired for strict linting, accessibility testing, and secret scanning out of the box.

## Requirements

- Node.js 24
- pnpm 10 (pinned via `packageManager`)
- [mise](https://mise.jdx.dev/) — provides gitleaks, shellcheck, and shfmt

## Quick Start

```bash
mise install
pnpm install
pnpm dev
```

Open <http://localhost:3000>.

`pnpm install` runs `playwright install chromium` afterwards, which the Storybook accessibility tests and the end-to-end tests both need.

## After Cloning This Template

Four things carry template defaults and need replacing before the project is yours.

| What                             | Where                           | Notes                                                                                              |
| -------------------------------- | ------------------------------- | -------------------------------------------------------------------------------------------------- |
| Package name                     | `package.json` `name`           |                                                                                                    |
| Application name and description | `src/app/layout.tsx` `metadata` | Page titles follow `「ページ名 \| アプリ名」`; the app name lives here only                        |
| Accent color                     | `src/helpers/theme.ts`          | One constant, consumed by both the app and Storybook                                               |
| Favicon                          | `src/app/favicon.ico`           | Still the Next.js default — it renders as the Next.js logo, so a missed replacement ships silently |

Changing the accent color to any [Radix color](https://www.radix-ui.com/colors) is a one-line edit:

```typescript
export const themeAccentColor = 'jade' as const;
```

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
```

Radix Themes components are imported directly rather than wrapped, so the template is usable immediately without per-component setup work.

Layer boundaries are enforced by dependency-cruiser, not convention alone. See [AGENTS.md](./AGENTS.md) for the full rules.

## Scripts

### Development

| Command          | Purpose                        |
| ---------------- | ------------------------------ |
| `pnpm dev`       | Development server (Turbopack) |
| `pnpm build`     | Production build               |
| `pnpm storybook` | Storybook on port 6006         |

### Testing

| Command              | Purpose                                      |
| -------------------- | -------------------------------------------- |
| `pnpm test`          | Unit tests and Storybook accessibility tests |
| `pnpm test:coverage` | Same, with coverage                          |
| `pnpm e2e`           | Playwright end-to-end tests                  |

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
