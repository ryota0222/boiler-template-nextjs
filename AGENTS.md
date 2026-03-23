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
