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

## No I/O, No Business Logic

Presenters contain only:

- String formatting and layout logic
- Display-related decisions (e.g., prefix labels, separators)

No file reads/writes, no HTTP requests, no domain rules, no orchestration.
