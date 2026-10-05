---
description: Rules for endpoint definitions and browser-side API calls in src/api/
paths: ['src/api/**/*.ts']
---

# API Rules

## What Lives in `src/api/`

`src/api/` holds everything about this application's own HTTP API, grouped by domain concept:

- **Endpoint definitions** — the HTTP method, path, input and output schemas, and success status. Both the server (`src/controllers/`) and the browser import them, so the URL and the types cannot drift apart.
- **Browser-side calls** — the TanStack Query options that the UI layers use.

It is distinct from `src/gateways/`, which runs on the server and talks to the database and external services.

## Directory Layout

Subdirectories are named by domain concept, matching `entities/` naming. File names carry only the role, because the directory already names the concept.

| File                     | Contents                                                      | Imported by          |
| ------------------------ | ------------------------------------------------------------- | -------------------- |
| `<concept>/endpoints.ts` | Endpoint definitions built with `defineEndpoint`              | controllers and api/ |
| `<concept>/queries.ts`   | Query keys and `queryOptions` for reads                       | features             |
| `<concept>/mutations.ts` | `mutationOptions` for writes, including any optimistic update | features             |

```text
src/api/
  endpoint.ts      # defineEndpoint — used only inside src/api/
  client.ts        # requestEndpoint — used only inside src/api/
  todo/
    endpoints.ts
    queries.ts
    mutations.ts
```

Call `requestEndpoint` directly inside `queryFn` and `mutationFn`; do not add a separate file of fetch functions.

The query key belongs in `queries.ts`, not in the component that reads it. A key duplicated across features drifts silently — nothing throws, the cache just stops updating.

## Endpoint Definitions

Build every definition with `defineEndpoint`. Split the input into `body`, `parameters`, and `query` so that a path parameter never collides with a body field. A path parameter is written `{name}` in `path`, and `parameters` must name exactly the same keys — `defineEndpoint` turns a mismatch into a type error, as it does a `body` on `GET` or `DELETE`.

```typescript
const okStatus = 200;

export const updateTodoEndpoint = defineEndpoint({
  inputSchema: z
    .object({
      body: z.object({ isCompleted: z.boolean() }).readonly(),
      parameters: z.object({ id: z.uuid() }).readonly(),
    })
    .readonly(),
  method: 'PATCH',
  outputSchema: todoSchema,
  path: '/api/todos/{id}',
  successStatus: okStatus,
});
```

Name a definition after the usecase operation it serves: `<verb><Concept><Rest>Endpoint`, with the concept in the singular (`listTodoEndpoint`, `updateTodoEndpoint`; see `usecases.md`, Naming).

`src/api/endpoint.ts` and the `endpoints.ts` files are the only files under `src/api/` that may import zod (besides `client.test.ts`, which defines its own endpoints so that it does not depend on any one concept), and an `endpoints.ts` file may import nothing under `src/api/` except `src/api/endpoint.ts`. dependency-cruiser enforces both, because the server imports these files and must not pull browser code into its bundle.

An `endpoints.ts` file is a declaration without branches. It is exercised by the controller test and the query test rather than by its own test file.

## Calling the API

Call endpoints through `requestEndpoint`, passing the endpoint definition. `buildPath` builds the path, including any path parameters; `requestEndpoint` appends `input.query` as a query string, sends the body as JSON, parses the response through the definition, and returns `Result<Output, ApiFailure>`. Network failures and non-JSON responses come back as the `network-failed` and `invalid-response` kinds instead of throwing.

A query without parameters does not need a factory function: export the options as a constant.

```typescript
export const todoListQueryOptions = queryOptions({
  queryFn: () => requestEndpoint({ endpoint: listTodoEndpoint, input: {} }),
  queryKey: todoListQueryKey,
});
```

A query that takes a parameter stays a function and annotates its return type with `ReturnType<typeof queryOptions<TQueryFnData, TError, TData, TQueryKey>>`, naming all four type arguments so the annotation does not depend on which overload TypeScript picks.

Because the query data is a `Result`, the component narrows it: `data === undefined` is loading, `!data.ok` is the failure to show, and `data.value` is the list. Mutations return a `Result` too, so a failed request reaches `onSuccess` and `onSettled` with `ok: false`, never `onError` (`state-management.md`).

## No React Hooks

`useQuery`, `useMutation`, and `useQueryClient` must not appear in `src/api/`. `queryOptions` and `mutationOptions` return plain objects, so they stay testable without rendering a component. Hooks are called from `src/features/`. ESLint rejects the import.

`requestEndpoint` fetches a relative URL, which only resolves in the browser; calling a query built with it from a Server Component (`prefetchQuery` or otherwise) fails.

## Allowed Dependencies

`src/api/` may depend only on `src/entities/`. `src/api/endpoint.ts` and `src/api/client.ts` may be imported only from inside `src/api/`. dependency-cruiser enforces this.

## Testing Guidelines

- Mock `fetch` and test that responses are parsed into entity types
- Test error cases (non-2xx status, invalid body, network failure)
- Test an optimistic update by calling the mutation's callbacks with a real `QueryClient` and reading the cache afterwards
