---
description: Rules for shared component definitions in src/shared-components/
paths: ['src/shared-components/**/*.tsx']
---

# Shared Component Rules

## What is a Shared Component

Shared components are domain-independent, reusable UI parts used across features. They have no knowledge of specific business domains or feature contexts.

## Structure

Components are organized in subdirectories with co-located stories.

```text
src/shared-components/
  shadcn/
    button/
      Button.tsx
      Button.stories.tsx
  badge/
    Badge.tsx
    Badge.stories.tsx
    badge.test.ts     # if needed
  query-provider/
    QueryProvider.tsx # Provider: no story, see below
```

Every component must have a co-located `.stories.tsx` file.

### Exception: Providers

A component that renders no markup of its own — one that only supplies context to `children` — has no story. Stories exist to be rendered and checked by axe, and a Provider contributes nothing for axe to inspect. A story for one would assert nothing.

This exception covers Providers only. A component that renders any markup, however thin the wrapper, needs a story.

```text
// Good: Provider with no story
src/shared-components/query-provider/
  QueryProvider.tsx

// Bad: a component that renders markup and has no story
src/shared-components/page-header/
  PageHeader.tsx
```

## No Domain Dependencies

Shared components must not depend on:

- `src/features/` (domain-specific components)
- `src/entities/` (domain models)
- `src/gateways/` (I/O layer)
- `src/presenters/` (display formatting)

They may only depend on `src/helpers/` and external libraries.
