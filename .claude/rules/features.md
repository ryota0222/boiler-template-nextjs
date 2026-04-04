---
description: Rules for feature component definitions in src/features/
paths: ['src/features/**/*.tsx', 'src/shared-components/**/*.tsx']
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

## `internal/` Subdirectory Structure

When a feature has an `internal/` directory containing multiple sub-components, each sub-component must be placed in its own subdirectory (kebab-case) within `internal/`. Flat placement of multiple components directly under `internal/` is forbidden.

```text
// Good
src/features/login-form/internal/
  email-form/
    EmailForm.tsx
    EmailForm.stories.tsx
    EmailForm.test.tsx
  otp-form/
    OtpForm.tsx
    OtpForm.stories.tsx
    OtpForm.test.tsx

// Bad: flat layout mixing multiple components
src/features/login-form/internal/
  EmailForm.tsx
  EmailForm.stories.tsx
  OtpForm.tsx
  OtpForm.stories.tsx
```

## `internal/` Placement

Place `internal/` directly under its sole consumer's directory. Never place it under a shared ancestor just because multiple siblings exist — if a component is truly shared, lift it to the appropriate shared layer instead.

```text
// Good: DurationInput is only used by form/, so it lives under form/internal/
features/work-canvas/time-entry/form/internal/duration-input/DurationInput.tsx

// Bad: placed at time-entry/internal/ even though only form/ uses it
features/work-canvas/time-entry/internal/duration-input/DurationInput.tsx
```

This rule is enforced by the `no-internal-cross-access` depcruise rule, which forbids accessing an `internal/` directory from outside its direct parent.

## ViewModels

UI-specific types that are not domain entities — such as aggregated display data — are ViewModels. Define them in `internal/` within the feature that uses them, not in `src/presenters/`.

```typescript
// Good: MonthlySummary is a display-only aggregate, lives in features/
// src/features/work-canvas/time-entry/list/internal/monthly-summary/monthlySummary.ts
export type MonthlySummary = {
  items: MonthlySummaryItem[];
  totalDurationMinutes: number;
  totalTaxIncludedAmount: number;
};

// Bad: defining a UI-only type in presenters/
// src/presenters/timeEntryPresenter.ts
export type MonthlySummary = { ... };
```

## Allowed Dependencies

Feature components may depend on:

- `src/entities/` (domain models)
- `src/gateways/` (data fetching)
- `src/presenters/` (display formatting)
- `src/helpers/` (utilities)
- `src/shared-components/` (shared UI parts)

Feature components must not depend on other features. Cross-feature logic should be lifted to a shared layer.
