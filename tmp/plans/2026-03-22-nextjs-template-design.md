# Next.js Template Design

## Overview

Create a Next.js App Router template (`nextjs-template`) as a sibling to `ts-script-template`, reusing the same toolchain and coding conventions.

## Approach

**A. `create-next-app` base** — Generate with `create-next-app`, then overlay the existing toolchain (ESLint, Prettier, Vitest, lefthook, commitlint, knip, depcruise, markdownlint, .claude/).

## Directory Structure

```text
nextjs-template/
  src/
    app/                  # App Router (layout.tsx, page.tsx, etc.)
    components/
      ui/                 # shadcn/ui components
    entities/             # Type definitions & zod schemas (domain models)
    gateways/             # I/O with external data sources
    libs/
      utils.ts            # cn() helper for shadcn
  public/                 # Static assets
  next.config.ts
  tailwind.config.ts
  postcss.config.mjs
  tsconfig.json
  eslint.config.ts
  vitest.config.ts
  .prettierrc
  lefthook.yml
  commitlint.config.ts
  components.json         # shadcn config
  package.json
  CLAUDE.md / AGENTS.md
  .claude/
  docs/rules/
```

## Changes from ts-script-template

| Item | ts-script-template | nextjs-template |
|---|---|---|
| Build | tsup | next build |
| Dev | tsx src/index.ts | next dev |
| Entry | src/index.ts (CLI) | src/app/layout.tsx + page.tsx |
| Added dirs | - | src/app/, src/components/, public/ |
| Dependencies | tsup, tsx | next, react, react-dom, tailwindcss, shadcn/ui |
| ESLint | current + check-file | current + @next/next + unicorn + check-file (tsx) |
| tsconfig | ES2024/bundler | Next.js standard base + strict settings carried over |
| AGENTS.md | CLI script | Next.js App Router |

## ESLint Configuration

| Plugin | Purpose |
|---|---|
| @eslint/js | Base recommended rules |
| typescript-eslint | strict + stylistic |
| eslint-plugin-perfectionist | import/export sorting |
| eslint-plugin-check-file | File/folder naming conventions |
| eslint-plugin-unicorn | Modern JS/TS best practices |
| @next/eslint-plugin-next | Next.js specific rules |

### ESLint Adjustments for Next.js

- `check-file` filename: `**/*.ts` → `**/*.{ts,tsx}`
- `naming-convention`: Allow PascalCase functions (React components)
- `func-style`: Allow PascalCase functions returning JSX
- `unicorn/filename-case`: off (conflicts with check-file)
- Add `@next/next` recommended rules

## shadcn/ui Integration

- Initialize with `shadcn` CLI
- Components in `src/components/ui/`
- Dependencies: class-variance-authority, clsx, tailwind-merge, lucide-react
- `cn()` helper in `src/libs/utils.ts`

## Carried Over (unchanged)

- Prettier config (.prettierrc)
- Vitest (adjusted for Next.js — jsdom environment for component tests)
- lefthook (pre-commit/commit-msg/pre-push)
- commitlint (conventional commits)
- knip
- dependency-cruiser
- markdownlint-cli2
- .claude/ rules and skills (adjusted for Next.js context)
- docs/rules/ (dependency-policy, implementation-patterns)
