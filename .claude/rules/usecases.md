---
description: Rules for usecase definitions in src/usecases/
paths: ['src/usecases/**/*.ts']
---

# Usecase Rules

## What is a Usecase

Usecases contain the application's business logic. They orchestrate the flow of data between gateways, presenters, and entities. Usecases do not perform I/O directly — they delegate to gateways and presenters via dependency injection.

## Structure

Each usecase module is one directory per domain concept, `src/usecases/<concept>/`. Its factory lives in `usecase.ts` and is tested in `usecase.test.ts` beside it; the module's gateway and presenter types sit in `gateways/` and `presenters/` next to them. The file exports one factory, which receives gateways and presenters and returns an object with the available operations.

```typescript
// src/usecases/todo/usecase.ts
export const createTodoUsecase = ({
  gateways,
}: {
  readonly gateways: { … };
}): {
  readonly create: (context: { … }) => Promise<Result<Todo, ApiFailure>>;
  readonly list: () => Promise<Result<readonly Todo[], ApiFailure>>;
  readonly update: (context: { … }) => Promise<Result<Todo, ApiFailure>>;
} => ({ … });
```

An operation that serves an endpoint receives `{ input }`, the input `createApiRequestUsecase` validated against the endpoint definition. When a gateway fails, the operation logs the gateway's error with `printErrorLog` and returns an `internal` failure with a message the user can read; the underlying error never reaches the response.

## Naming

- The factory keeps the concept noun (`createTodoUsecase`), because a controller imports several factories side by side
- An operation omits the concept noun, because the factory already names it: `createTodoUsecase(…).list`, not `.listTodos`. Keep a noun only when the operation targets something other than the concept itself
- Use these verbs for the standard operations:

| Verb     | Use for                                                                                                        |
| -------- | -------------------------------------------------------------------------------------------------------------- |
| `get`    | one item. Never `read`                                                                                         |
| `list`   | several items                                                                                                  |
| `create` | adding an item                                                                                                 |
| `update` | changing an item                                                                                               |
| `remove` | deleting an item. Never `delete`: it is a reserved word, so an operation named `delete` cannot be destructured |

- Any other action uses its own verb (`review`, `answer`, `start`, `check`, `handle`)
- Endpoint definitions and controller handlers are named after the same verb: `<verb><Concept><Rest>Endpoint` and `handle<Verb><Concept><Rest>Request`, with the concept in the singular (`list` on `todo` → `listTodoEndpoint`, `handleListTodoRequest`)

## Factory Pattern

- The factory function receives `gateways` and `presenters` as parameters
- No default values for dependencies — the caller (the controller) provides all concrete implementations
- The factory returns an object with the available operations

## Interface Type Definitions

Gateway and presenter interface types are defined under the usecase layer, not in the implementation files:

- `src/usecases/<concept>/gateways/` — gateway interface types
- `src/usecases/<concept>/presenters/` — presenter interface types

The inner layer (usecase) defines the interfaces, and the outer layer (gateway, presenter) implements them. These directories contain **only type definitions**; ESLint rejects value-level exports there.

## No Direct I/O

Usecases must not import from `src/gateways/` or `src/presenters/` implementation files, or from the UI layers and `src/api/`. Only import interface types from `src/usecases/<concept>/gateways/` and `src/usecases/<concept>/presenters/`. dependency-cruiser enforces this.

## Testing Guidelines

- Test via the factory: create usecases with stub gateways and presenters
- Test each branch (success, gateway failure, not found, validation failure)
