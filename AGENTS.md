# Agent Guidelines

This file provides guidance to LLM agents when working with code in this repository.

## Project Overview

Next.js App Router web application template for Node.js v22+ / ESM. Uses Tailwind CSS and shadcn/ui for styling.

## Directory Structure

```text
src/
  app/              # App Router (layout.tsx, page.tsx, loading.tsx, error.tsx, etc.)
  components/
    ui/             # shadcn/ui components
  entities/         # Type definitions & zod schemas (domain models)
  gateways/         # I/O with external data sources (API, DB, CSV, etc.)
  libs/             # Implementation (organized by feature subdirectories)
```

- `app/` contains Next.js App Router convention files (layout, page, loading, error, not-found)
- `components/ui/` contains shadcn/ui components (managed by shadcn CLI)
- `components/` (non-ui) contains custom React components
- `entities/` contains only data structure definitions (no logic)
- `gateways/` handles I/O with external data sources, organized by concern into subdirectories
- `libs/` contains implementations, organized by concern into subdirectories
- Test files are co-located with their source files (`foo.ts` → `foo.test.ts`, `foo.tsx` → `foo.test.tsx`)
