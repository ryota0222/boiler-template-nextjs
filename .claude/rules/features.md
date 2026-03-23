---
description: Rules for feature component definitions in src/features/
paths: ['src/features/**/*.tsx']
---

# Feature Rules

## What is a Feature

Features are domain-specific UI components organized by business feature. Each feature directory groups components, hooks, and logic related to a specific domain concern.

## Structure

Organize by feature subdirectories. Each component lives in its own directory named to match the component.

```text
src/features/
  airport/
    card/
      Card.tsx
      Card.stories.tsx
      card.test.ts        # if needed
  flight/
    search-form/
      SearchForm.tsx
      SearchForm.stories.tsx
    result-table/
      ResultTable.tsx
      ResultTable.stories.tsx
```

Every component must have a co-located `.stories.tsx` file.

## Allowed Dependencies

Feature components may depend on:

- `src/entities/` (domain models)
- `src/gateways/` (data fetching)
- `src/presenters/` (display formatting)
- `src/helpers/` (utilities)
- `src/shared-components/` (shared UI parts)

Feature components must not depend on other features. Cross-feature logic should be lifted to a shared layer.
