---
description: Rules for presenter definitions in src/presenters/
paths: ['src/presenters/**/*.ts']
---

# Presenter Rules

## What is a Presenter

Presenters are responsible for display-related processing — converting domain data into strings or other presentation formats for output. They are pure functions with no I/O and no business logic.

## Structure

Each presenter file exports pure functions that take domain entity types and return formatted strings.

```typescript
import type { ResultMessage } from '@/entities/resultMessage';

export const formatInspectionResultArray = (resultArray: readonly InspectionResult[]): string => {
  // formatting logic only
};
```

## File Naming

Name presenter files after the type of value they format, not after a feature or domain. The file name should reflect the shape of the input argument.

```text
// Good
presenters/date.ts       // formats ISO date strings
presenters/duration.ts   // formats duration in minutes

// Bad: named after a feature
presenters/timeEntryPresenter.ts
```

## No Type Definitions

Presenters must not define types. They only export pure formatting functions. UI-specific types (ViewModels) belong in the `features/` layer.

```typescript
// Good: only a function, no type export
export const formatDuration = (durationMinutes: number): string => { ... };

// Bad: type defined in a presenter
export type MonthlySummary = { ... };
```

## No I/O, No Business Logic

Presenters contain only:

- String formatting and layout logic
- Display-related decisions (e.g., prefix labels, separators)

No file reads/writes, no HTTP requests, no domain rules, no orchestration.
