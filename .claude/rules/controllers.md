---
description: Rules for controller definitions in src/controllers/
paths: ['src/controllers/**/*.ts', 'src/app/**/route.ts']
---

# Controller Rules

## What is a Controller

Controllers handle HTTP requests for Next.js Route Handlers. They wire concrete gateways and presenters into a usecase, call it, and return the `Response` it produces.

## Structure

Each controller is a single file named `<concept>Controller.ts` (camelCase), placed directly under `src/controllers/`. It exports one handler per HTTP method the route supports, named `handle<Verb><Concept><Rest>Request` (`usecases.md`, Naming).

The Route Handler only re-exports the controller's handler under the method name Next.js requires. It holds no conditional logic and no other code. dependency-cruiser rejects any import from `src/app/**/route.ts` other than `src/controllers/`.

Write it as `export { … as GET } from`; ESLint's `unicorn/prefer-export-from` rejects an `import` followed by `export const GET = …`.

```typescript
// src/app/api/todos/route.ts
export {
  handleListTodoRequest as GET,
  handleCreateTodoRequest as POST,
} from '@/controllers/todoController';
```

## Dependency Injection

Controllers are the composition root: they are the only layer that imports concrete implementations from `src/gateways/` and `src/presenters/` and passes them to a usecase factory. Usecases never import them directly.

When a gateway needs request-specific input, the controller binds it through the gateway's curried factory so the usecase receives an argument-free function (`gateways.md`).

## API Endpoints Use the Shared Request Usecase

Every API endpoint goes through `createApiRequestUsecase` in `src/usecases/api-request/`. It reads the request, validates the input against the endpoint definition from `src/api/<concept>/endpoints.ts`, runs the endpoint-specific `execute`, and turns the outcome into a `Response`. Do not re-implement any of these steps in a controller.

```typescript
export const handleListTodoRequest = (request: Request): Promise<Response> =>
  createApiRequestUsecase({
    gateways: {
      printErrorLog,
      readRequestInput: createReadingRequestInput({ parameters: Promise.resolve({}), request }),
    },
    presenters: { presentFailure, presentSuccess },
  }).handle({
    endpoint: listTodoEndpoint,
    execute: createTodoUsecase({ gateways: { createTodo, listTodos, printErrorLog, updateTodo } })
      .list,
  });
```

`execute` returns `Result<Output, ApiFailure>`. Pick the `ApiFailure` kind from `src/entities/apiFailure.ts`; the presenter maps each kind to its HTTP status. Add a new kind there, with its status in `src/presenters/apiResponsePresenter.ts`, only when an endpoint needs it.

A Route Handler with a dynamic path segment is called by Next.js with a second argument carrying that segment, so its controller handler takes it too and threads it into `createReadingRequestInput`'s `parameters` — the one case where a function takes two parameters. ESLint allows two parameters in `src/controllers/` only.

```typescript
export const handleUpdateTodoRequest = (
  request: Request,
  context: { readonly params: Promise<{ readonly id: string }> }
): Promise<Response> => …;
```

Controllers may import endpoint definitions from `src/api/<concept>/endpoints.ts` and nothing else under `src/api/`. dependency-cruiser enforces this.

## No Business Logic in Controllers

Controllers contain only:

- Reading and parsing request input
- Usecase factory creation and invocation
- Returning the `Response`

No domain rules, no direct I/O, no response formatting beyond what presenters return.

## Testing Guidelines

Branches belong in usecases and presenters and are tested there. A controller test mocks the gateway modules with `vi.mock` and checks one representative path per handler, so that the wiring itself is executed.
