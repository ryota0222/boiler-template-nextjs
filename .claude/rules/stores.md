---
description: Rules for client UI state stores in src/stores/
paths: ['src/stores/**/*.ts', 'src/stores/**/*.tsx']
---

# Store Rules

## What is a Store

Stores hold client UI state that must be shared across the component tree — state that has no server counterpart and is not derivable from server state. They are built with Zustand.

Examples: toast notifications, a global command palette's open state, a multi-step wizard's cursor.

## When Not to Use a Store

A store is the wrong tool for two common cases:

| State                                               | Correct tool                                             |
| --------------------------------------------------- | -------------------------------------------------------- |
| Data originating from an external data source       | TanStack Query (see `.claude/rules/state-management.md`) |
| State used by one component and its direct children | `useState`                                               |

Reach for a store only when the state is genuinely read or written from separate branches of the tree. Adding a store for state that `useState` already covers makes the data flow harder to follow with no benefit.

## Structure

Each store lives in its own kebab-case directory, paired with the Provider that scopes it.

```text
src/stores/
  notification/
    notificationStore.ts          # createStore factory + types
    NotificationStoreProvider.tsx # 'use client' Context Provider
    notificationStore.test.ts     # if needed
```

The store file exports a factory, never a ready-made store instance.

```typescript
// Good
// src/stores/notification/notificationStore.ts
import { createStore } from 'zustand/vanilla';

export const createNotificationStore = () =>
  createStore<NotificationStore>()((set) => ({
    ...
  }));

// Bad: a module-scoped instance shared across every request
export const notificationStore = createStore<NotificationStore>()((set) => ({
  ...
}));
```

## Per-Request Store Is Mandatory

A Next.js server handles concurrent requests in one process. A module-scoped store is a module-level variable shared across all of them, which leaks one user's state to another. The store must be created inside the Provider via `useState` so each request and each client mount gets its own instance.

This is the pattern the Zustand documentation prescribes for Next.js, and it is the reason the factory is exported rather than the store.

## React Server Components Must Not Touch Stores

RSCs cannot use hooks or context and are not meant to be stateful. Reading or writing a store from an RSC violates the App Router architecture.

Stores are consumed only from Client Components.

## Allowed Dependencies

Stores may depend on:

- `src/entities/` (domain models)
- External libraries

Stores must not depend on `src/gateways/`, `src/presenters/`, `src/helpers/`, `src/features/`, `src/shared-components/`, or `src/app/`. This is enforced by the `no-stores-depend-on-non-entities` depcruise rule.

A store that needs data from a gateway is a sign the state belongs in TanStack Query instead.

## Testing Guidelines

- Test the factory, not a shared instance — create a fresh store per test case
- Test state transitions through the store's actions rather than by writing state directly
