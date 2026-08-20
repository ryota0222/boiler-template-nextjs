---
description: Rules for gateway definitions in src/gateways/
paths: ['src/gateways/**/*.ts']
---

# Gateway Rules

## What is a Gateway

Gateways are the I/O boundary of the application, responsible for communication with external data sources (API, DB, CSV files, etc.). They encapsulate all external access and return domain entity types.

## Library Clients Are an Exception

`src/gateways/prismaClient.ts` is a configured library client — the `PrismaClient` instance itself — not a gateway function. It satisfies neither rule below: it exports no async I/O function and returns no entity type, and it does not sit in a domain subdirectory named after an `entities/` concept.

It lives in `src/gateways/` rather than `src/helpers/` because a client typed with the application's own generated schema is not domain-independent; see `docs/rules/dependency-policy.md` ("Gateways May Import Library Clients From Helpers") for the reasoning. Domain gateway files (`<domain>/<domain>.ts`) import this client and are the ones that must follow the rules in this document.

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
| `<domain>.ts`         | The actual I/O and conversion to entity types      |
| `<domain>Query.ts`    | The query key and `queryOptions`                   |
| `<domain>Mutation.ts` | `mutationOptions`, including the optimistic update |

The I/O file carries no suffix. `src/gateways/` already states that the file performs I/O, so `Gateway` repeats the directory and adds nothing a reader did not already know. `Query` and `Mutation` do carry a suffix because they distinguish two further concerns inside the same domain.

```text
// Good
src/gateways/user/user.ts
src/gateways/user/userQuery.ts
src/gateways/user/userMutation.ts

// Bad: the suffix repeats the directory
src/gateways/user/userGateway.ts
```

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

- Test the database against a real PostgreSQL instance, not a mock. Name these files `<domain>.db.test.ts`; they run in the `db` Vitest project, which `pnpm test` excludes and `pnpm test:db` runs. Mocking Prisma verifies only that a method was called — it proves nothing about whether the query is correct, while still costing a rewrite of every stubbed return value on each schema change.
- Use test doubles (mock/stub) for other external data sources (HTTP APIs, files).
- Test that external data is correctly parsed into entity types.
- Test error cases (network failure, invalid data, etc.).
