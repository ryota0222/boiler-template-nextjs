---
description: Rules for server state, client UI state, and optimistic updates
paths:
  ['src/gateways/**/*.ts', 'src/features/**/*.tsx', 'src/stores/**/*.ts', 'src/stores/**/*.tsx']
---

# State Management

## Server State Is Managed by TanStack Query

- **Type**: MUST
- **Reason**: An optimistic value written to the query cache is visible to every component subscribing to the same query key, regardless of where it sits in the tree. `useOptimistic` keeps its optimistic value local to the component that calls the hook, so sharing it requires lifting state to a common ancestor, which turns that entire subtree into a Client Component.

### Details

Data that originates from an external data source (API, DB, CSV) is server state and is read and written through TanStack Query. Do not use `useOptimistic` for server state — two competing patterns for the same concern make the codebase unpredictable.

`useState` remains correct for state that never leaves a single component (input focus, a locally toggled disclosure).

## Query Keys and Options Live in `gateways/`

- **Type**: MUST
- **Reason**: A query key duplicated in two places drifts silently. Nothing throws — the cache simply stops updating, and the bug surfaces as "the list does not refresh" long after the change that caused it.

### Details

Each domain directory under `src/gateways/` owns three files:

| File                  | Contents                                                           |
| --------------------- | ------------------------------------------------------------------ |
| `<domain>Gateway.ts`  | The actual I/O (`fetch`, DB access) and conversion to entity types |
| `<domain>Query.ts`    | The query key and `queryOptions`                                   |
| `<domain>Mutation.ts` | `mutationOptions` including the optimistic update                  |

```typescript
// Good
// src/gateways/todo/todoQuery.ts
import { queryOptions } from '@tanstack/react-query';

import { fetchTodoList } from '@/gateways/todo/todoGateway';

export const todoListQueryKey = ['todos'];

export const todoListQueryOptions = () =>
  queryOptions({
    queryFn: fetchTodoList,
    queryKey: todoListQueryKey,
  });

// Bad: the key is written inline where it is used
// src/features/todo/list/TodoList.tsx
const { data } = useQuery({ queryFn: fetchTodoList, queryKey: ['todos'] });
```

## React Hooks Must Not Appear in `gateways/`

- **Type**: MUST NOT
- **Reason**: `gateways/` must stay callable from Server Components for `prefetchQuery`, and must stay testable without rendering a component. A hook call in this layer breaks both.

### Details

`queryOptions()` and `mutationOptions()` return plain objects and have no React dependency, so they belong in `gateways/`. `useQuery`, `useMutation`, and `useQueryClient` are hooks and belong in `features/`.

The optimistic update callbacks receive the `QueryClient` through their `context` argument, so `useQueryClient()` is never needed to write them.

```typescript
// Good: gateways/ defines the options, features/ calls the hook
// src/features/todo/list/TodoList.tsx
const { data } = useQuery(todoListQueryOptions());

// Bad: a hook inside gateways/
// src/gateways/todo/todoQuery.ts
export const useTodoList = () => useQuery({ ... });
```

## Optimistic Updates Must Perform All Four Steps

- **Type**: MUST
- **Reason**: Each omitted step produces a distinct defect. Skipping the cancel lets an in-flight refetch overwrite the optimistic value, making the UI flicker back and forth. Skipping the snapshot makes rollback impossible. Skipping the invalidate leaves the cache holding a guess instead of the server's answer.

### Details

1. `onMutate` — `cancelQueries` to stop in-flight refetches
2. `onMutate` — `getQueryData` to snapshot the current value, returned for rollback
3. `onMutate` — `setQueryData` to write the optimistic value
4. `onError` — restore the snapshot, and `onSettled` — `invalidateQueries`

Three type-level constraints apply, all verified against `@tanstack/react-query` 5.101.4:

- The generic parameters of `mutationOptions<TData, TError, TVariables, TOnMutateResult>` must be written explicitly. The return type of `onMutate` is not inferred, and `onMutateResult` degrades to `unknown` without them.
- `onMutateResult` in `onError` is typed `TOnMutateResult | undefined`, because `onMutate` may itself have thrown. Access it with `?.`.
- The `current` argument of a `setQueryData` updater is typed `T | undefined`, because the key may hold nothing yet. Access it with `?.`.

```typescript
// Good
// src/gateways/todo/todoMutation.ts
import { mutationOptions } from '@tanstack/react-query';

import { type Todo } from '@/entities/todo/todo';
import { putTodo } from '@/gateways/todo/todoGateway';
import { todoListQueryKey } from '@/gateways/todo/todoQuery';

type TodoListSnapshot = { snapshot: Todo[] | undefined };

export const updateTodoMutationOptions = () =>
  mutationOptions<Todo, Error, Todo, TodoListSnapshot>({
    mutationFn: putTodo,
    onError: (_error, _todo, onMutateResult, context) => {
      context.client.setQueryData(todoListQueryKey, onMutateResult?.snapshot);
    },
    onMutate: async (todo, context) => {
      await context.client.cancelQueries({ queryKey: todoListQueryKey });
      const snapshot = context.client.getQueryData<Todo[]>(todoListQueryKey);

      context.client.setQueryData<Todo[]>(todoListQueryKey, (current) =>
        current?.map((item) => (item.id === todo.id ? todo : item))
      );

      return { snapshot };
    },
    onSettled: (_data, _error, _todo, _onMutateResult, context) =>
      context.client.invalidateQueries({ queryKey: todoListQueryKey }),
  });

// Bad: no cancel, no snapshot, no rollback
export const updateTodoMutationOptions = () =>
  mutationOptions({
    mutationFn: putTodo,
    onMutate: (todo, context) => {
      context.client.setQueryData(todoListQueryKey, todo);
    },
  });
```

`eslint.config.ts` disables `max-params` and `@typescript-eslint/explicit-function-return-type` for `src/gateways/**/*Query.ts` and `src/gateways/**/*Mutation.ts`. The callback arities are fixed by the library, and the option object types are library-generated generics that cannot be written by hand.

## Optimistic Updates Require All Three Preconditions

- **Type**: MUST
- **Reason**: An optimistic update is a bet that the server will agree. When the bet is wrong the user has already been shown a false result, so the cost of being wrong must be near zero.

### Details

Use an optimistic update only when all three hold:

1. The operation rarely fails
2. Failure causes no real harm and is fully recovered by the rollback
3. The server does not alter the value — no ID assignment, no normalization, no permission-dependent outcome

If any one fails, use a pessimistic update and show a pending state instead.

## Optimistic Updates Are Forbidden for Irreversible or Contended Operations

- **Type**: MUST NOT
- **Reason**: A rollback restores the UI, not the world. Showing a payment as complete before the server confirms it means the user acts on information that was never true.

### Details

Forbidden for:

- Payments and billing
- Inventory and seat reservation, or anything where concurrent users contend for the same resource
- Irreversible deletion
- Any operation whose result the server generates — a new record's ID, a server timestamp, a normalized value

## Rollback Must Be Accompanied by a User-Visible Notification

- **Type**: MUST
- **Reason**: The rollback is silent by design. Without a notification the user sees their change appear and then vanish with no explanation, and will usually retry the same failing operation.

### Details

`onError` must both restore the snapshot and surface the failure to the user.

## `QueryClient` Must Not Be Created at Module Scope

- **Type**: MUST NOT
- **Reason**: A Next.js server handles concurrent requests in one process. A module-scoped `QueryClient` is shared across all of them, so one user's cached data is served to another.

### Details

Create it inside `useState` so React keeps one instance per client mount, and one per request on the server.

```typescript
// Good
// src/shared-components/query-provider/QueryProvider.tsx
const [queryClient] = useState(createQueryClient);

// Bad
const queryClient = createQueryClient();
```

The same constraint applies to Zustand stores. See `.claude/rules/stores.md`.
