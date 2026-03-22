---
description: Rules for entity definitions in src/entities/
paths: ['src/entities/**/*.ts']
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

## Zod Testing Guidelines

Do not test zod's built-in behavior. Only test **custom constraints** you have added:

- `z.string()` → no test needed (testing zod itself)
- `z.string().nullable()` → test that `null` is accepted
- `z.number().int()` → test that decimals are rejected
- `z.enum(['OK', 'WARN'])` → test both accepted and rejected values (restricts allowed values)
- `z.object({...}).readonly()` → no test needed for readonly
- Custom `.refine()` / `.transform()` → always test
