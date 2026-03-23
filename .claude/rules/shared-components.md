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
```

Every component must have a co-located `.stories.tsx` file.

## No Domain Dependencies

Shared components must not depend on:

- `src/features/` (domain-specific components)
- `src/entities/` (domain models)
- `src/gateways/` (I/O layer)
- `src/presenters/` (display formatting)

They may only depend on `src/helpers/` and external libraries.
