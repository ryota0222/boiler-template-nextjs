---
description: Rules for entity definitions in src/entities/
paths: ['src/entities/**/*.ts', '!src/entities/**/*.test.ts']
---

# Entity Rules

## What is an Entity

Entities are central elements of domain models, representing business concepts within the domain. They are implemented as **types and functions**, not classes (data must be serializable for persistence).

## Structure

Each entity file exports:

1. A `schema` (zod object, always `.readonly()`)
2. A `Type` inferred from the schema (`zod.infer<typeof schema>`)
3. Pure functions that operate on the entity

```typescript
export const schema = z
  .object({
    iataCode: iataCodeSchema,
    sortIndex: sortIndexSchema,
  })
  .readonly();

export type Airport = z.infer<typeof schema>;

const sort = (airportArray: Airport[]): Airport[] =>
  sortBy(airportArray, (airport) => airport.sortIndex);
```

## No Logic in Entities

Entities contain only:

- Zod schema definitions
- Type exports
- Pure functions that operate on the entity type

No I/O, no side effects, no external service calls.

## Entity Schema Represents Domain, Not Backend

Entity schemas define the domain model — they are NOT a mirror of backend data structures (database columns, API responses, CSV fields, etc.). Design schemas with the most appropriate types and structure for the domain, regardless of how data is stored or transferred externally.

- Use `z.iso.date()` / `z.iso.time()` instead of raw `z.string().regex()` when the value represents a date or time
- Use `z.uuid()` instead of `z.string()` when the value is a UUID
- Field names follow domain conventions (e.g., `userID`), not backend conventions (e.g., `user_id`)
- Gateways are responsible for mapping between external data and entity schemas
