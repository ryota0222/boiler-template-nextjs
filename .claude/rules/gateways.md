---
description: Rules for gateway definitions in src/gateways/
paths: ['src/gateways/**/*.ts']
---

# Gateway Rules

## What is a Gateway

Gateways are the I/O boundary of the application, responsible for communication with external data sources (API, DB, CSV files, etc.). They encapsulate all external access and return domain entity types.

## Structure

Each gateway file exports:

1. Async functions that perform I/O with external data sources
2. Return values are always domain entity types (defined in `src/entities/`)

```typescript
import { schema, type Airport } from '@/entities/airport';

export const fetchAirports = async (): Promise<Airport[]> => {
  const response = await fetch('https://api.example.com/airports');
  const data = await response.json();
  return schema.array().parse(data);
};
```

## Directory Naming

Subdirectories are named by domain concept, matching `entities/` naming (e.g., `entities/airport/` ↔ `gateways/airport/`).

## File Layout Within a Domain

A domain directory holds up to three files, split by concern:

| File                  | Contents                                           |
| --------------------- | -------------------------------------------------- |
| `<domain>Gateway.ts`  | The actual I/O and conversion to entity types      |
| `<domain>Query.ts`    | The query key and `queryOptions`                   |
| `<domain>Mutation.ts` | `mutationOptions`, including the optimistic update |

The query key belongs here, not in the component that reads it. A key duplicated across features drifts silently — nothing throws, the cache just stops updating.

## No Business Logic in Gateways

Gateways contain only:

- External data source access (HTTP requests, DB queries, file reads, etc.)
- Conversion from external data to domain entity types (via zod parse)
- Cache policy and the optimistic update definition (`queryOptions` / `mutationOptions`)

No business logic, no domain rules, no orchestration of multiple gateways.

Cache policy is part of the I/O concern, which is why `queryOptions` and `mutationOptions` live here rather than in a layer of their own. Both return plain objects and carry no React dependency, so this does not change what the layer is.

## No React Hooks in Gateways

`useQuery`, `useMutation`, and `useQueryClient` must not appear in `src/gateways/`.

Gateways must stay callable from Server Components for `prefetchQuery`, and must stay testable without rendering a component. A hook call in this layer breaks both. Hooks are called from `src/features/`.

The optimistic update callbacks receive the `QueryClient` through their `context` argument, so writing them never requires `useQueryClient()`.

```typescript
// Good: gateways/ defines the options, features/ calls the hook
// src/features/todo/list/TodoList.tsx
const { data } = useQuery(todoListQueryOptions());

// Bad: a hook inside gateways/
// src/gateways/todo/todoQuery.ts
export const useTodoList = () => useQuery({ ... });
```

See `.claude/rules/state-management.md` for the required optimistic update pattern and its type-level constraints.

## Testing Guidelines

- Use test doubles (mock/stub) for external data sources
- Test that external data is correctly parsed into entity types
- Test error cases (network failure, invalid data, etc.)
