---
description: Rules for gateway definitions in src/gateways/
paths: ['src/gateways/**/*.ts']
---

# Gateway Rules

## What is a Gateway

Gateways are the I/O boundary of the application, responsible for communication with external data sources (API, DB, file system, console, etc.). They run on the server and encapsulate all external access. Browser-side calls to this application's own API are not gateways; they live in `src/api/` (`api.md`).

## Library Clients Are an Exception

`src/gateways/prismaClient.ts` is a configured library client — the `PrismaClient` instance itself — not a gateway function. It caches the client on `globalThis` so that Next.js HMR does not open a new connection pool on every reload. Only `src/gateways/` and `*.db.test.ts` files may import it; dependency-cruiser (`only-gateways-use-database`) rejects the import from any other layer.

## Structure

Each gateway is a single file named `<domainConcept>Gateway.ts` (camelCase), placed directly under `src/gateways/`. It exports async functions that perform I/O, typed with the interface the usecase declares.

```typescript
// src/gateways/todoGateway.ts
import type { ListTodos } from '@/usecases/todo/gateways/todoGateway';

export const listTodos: ListTodos = async (): Promise<Result<readonly Todo[]>> => {
  // query, then validate into entity types
};
```

## Interface Types

Gateway interface types are defined in `src/usecases/<concept>/gateways/`, not in gateway implementation files. The usecase layer defines what it needs, and the gateway layer implements it.

## File Naming

- Gateway file: `<domainConcept>Gateway.ts` (camelCase)
- Unit test: `<domainConcept>Gateway.test.ts`; DB test: `<domainConcept>Gateway.db.test.ts` (co-located)

## Domain Types as Input, Domain Types as Output

Gateways accept domain entity types from the usecase layer and convert them to external formats (SDK types, API payloads, database rows) internally. When reading external data, they return validated domain entity types — not raw `unknown` and not database rows.

## Curried Read Functions

When a read depends on something only the controller knows (a file path, a request), the gateway exports a factory that takes it and returns an argument-free function, so the usecase never learns the data source. `createReadingRequestInput` is one.

```typescript
export const createReadingRequestInput =
  ({ parameters, request }: { … }): ReadRequestInput =>
  async (): Promise<Result<RequestInput, ApiFailure>> => { … };
```

## Return Values

Gateways never throw. A gateway is the boundary where an external API throws, so it catches there and returns a `Result` (`src/entities/result.ts`, `coding-standards.md`).

```typescript
// Prisma は接続やクエリの失敗を例外で返すため、ここで Result に変える
const findTodoRecords = async (): Promise<Result<readonly TodoRecord[]>> => {
  try {
    return { ok: true, value: await prisma.todo.findMany({ orderBy: { createdAt: 'asc' } }) };
  } catch (error) {
    return { error: toError(error), ok: false };
  }
};
```

A missing record is not an error at this layer: return `null` inside an `ok` result and let the usecase decide that it is a `not-found` failure.

## Validating External Data with Zod

Data from an external source is validated with a zod schema and `safeParse`, then mapped onto a `Result`. Do not use manual type guards, and do not use `parse`, which throws.

## No Business Logic in Gateways

Gateways contain only:

- External data source access (HTTP requests, DB queries, file reads, console output, etc.)
- Conversion between domain entity types and external formats

No business logic, no domain rules, no orchestration of multiple gateways.

## Testing Guidelines

- Verify queries against a real PostgreSQL in `<domainConcept>Gateway.db.test.ts`, run by `pnpm test:db` (Docker). A mocked Prisma client proves nothing about whether the SQL is correct
- Cover other branches (conversion, parsing, error mapping) in `<domainConcept>Gateway.test.ts` with test doubles for the external source
- `*.db.test.ts` files follow the database testing rules below rather than `test-standards.md`'s "Test Only Branches"

### Database Tests

Each test starts from an empty database: `vitest.db.setup.ts` truncates the tables before every test, and `vitest.db.globalSetup.ts` applies the migrations once. Create the rows a test needs inside the test with `prisma`.
