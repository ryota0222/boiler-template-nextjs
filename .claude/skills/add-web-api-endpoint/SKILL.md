---
name: add-web-api-endpoint
description: Use when adding an HTTP API endpoint (a Route Handler under src/app/api/) to this application. Scaffolds the endpoint definition, the usecase operation, the controller handler, the Route Handler, and their tests with the `api` plop generator, then lists what to fill in.
---

# Add an API Endpoint

Start every new API endpoint with the `api` generator instead of writing its files by hand, so that the files, names, and wiring are the same every time and only the content is left to write. The generator is defined in `plopfile.ts`, with its Handlebars templates in `plop-templates/api/`. Pass every argument by name after `--`. From a terminal, plop asks for a missing one; without a terminal (an agent's shell, a script), `plopfile.ts` checks before plop asks and exits with code 1 and a message naming the missing arguments, because plop's prompt would otherwise wait for input forever.

```bash
pnpm run generate api -- --concept inventory-item --action list --method GET --path /api/inventory-items
```

| Argument    | Form                                                                                                                                        |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `--concept` | kebab-case domain concept, the `src/api/<concept>/` and `src/usecases/<concept>/` directory (`inventory-item`)                              |
| `--action`  | camelCase name of the usecase operation, following Naming in `.claude/rules/usecases.md` (`list`, `get`, `create`, `update`, `remove`)      |
| `--method`  | `GET`, `POST`, `PUT`, `PATCH`, or `DELETE`                                                                                                  |
| `--path`    | starts with `/api/`; kebab-case segments and `{camelCase}` dynamic segments only, each dynamic name used once (`/api/inventory-items/{id}`) |

`--path`'s dynamic segments are written `{camelCase}`, the same form `defineEndpoint`'s `path` and `buildPath` use; the generator converts them to Next.js's `[camelCase]` for the Route Handler's directory (`/api/inventory-items/{id}` → `src/app/api/inventory-items/[id]/route.ts`).

`--action` becomes the operation's name as it is, so it follows the usecase naming rule: leave out the concept noun (`list`, not `listInventoryItems`), keep a noun only when the operation targets something other than the concept (`getLatestSet`), and use `get` for one item, `list` for several, and `create`, `update`, and `remove` for changes. The generator rejects an action whose first word is `delete` or `read` (use `remove` or `get`) and one that contains the concept's name in PascalCase.

The action is split into its leading lowercase verb and the rest, and the endpoint and handler are named `<verb><Concept><Rest>Endpoint` and `handle<Verb><Concept><Rest>Request`, with the concept in PascalCase: `getLatestSet` on `inventory-item` gives `getInventoryItemLatestSetEndpoint` and `handleGetInventoryItemLatestSetRequest`.

## What It Writes

With the arguments above it writes:

| File                                                  | Contents                                                                                                                                                                                                                                                                                                                              |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/api/inventory-item/endpoints.ts`                 | `listInventoryItemEndpoint`, built with `defineEndpoint`. Created if missing, otherwise appended to. A success-status `const` (`okStatus`, `createdStatus`, `noContentStatus`) is added only when the file does not already declare one                                                                                               |
| `src/usecases/inventory-item/usecase.ts` and test     | `createInventoryItemUsecase` gains the operation named by `--action` (the file is created when missing). The operation returns the `internal` failure 「この機能はまだ実装されていません」 until it is written, and `usecase.test.ts` gets a test for it                                                                              |
| `src/controllers/inventoryItemController.ts` and test | `handleListInventoryItemRequest`, created or appended, wired through `createApiRequestUsecase` (`.claude/rules/controllers.md`). A new controller gets a `createRequestUsecase` helper, the same shape as `todoController.ts`; a controller that already has one reuses it, and one without it calls `createApiRequestUsecase` inline |
| `src/app/api/inventory-items/route.ts`                | `export { handleListInventoryItemRequest as GET } from '@/controllers/inventoryItemController';`. Created if missing; another method on the same path is added to the existing `export { … } from` statement                                                                                                                          |

A dynamic segment becomes a `parameters` field of the input schema and the controller handler's second argument (`context.params`). `POST`, `PUT`, and `PATCH` get an empty `body` object in the input schema. `POST` answers `201`, `DELETE` answers `204` with `z.null()` as its output schema (the presenter sends no body and `requestEndpoint` reads an empty body as `null`), and the rest answer `200`. Missing imports are added to the files it appends to; `ApiFailure` and `Result` come from `@/entities/apiFailure` and `@/entities/result`. The generated files are sorted and formatted with the same perfectionist rules and Prettier configuration as the rest of the code, and pass `pnpm run typecheck`, `pnpm run lint`, `pnpm run depcruise`, and `pnpm test` as they are.

`endpoints.ts` gets no test file of its own: it is a declaration without branches, exercised through the controller test (`.claude/rules/api.md`).

## How the Usecase Is Edited

The generator edits `usecase.ts` through the TypeScript compiler API, not by text search, so a hand-written usecase can gain operations too. It finds `export const create<Concept>Usecase = (…): { … } => …`, adds the operation to the object type of the return type and to the returned object literal (the body `=> ({ … })`, or the last `return { … };` of a block body), and leaves the factory's parameters and gateways untouched. The generated test builds the factory with `vi.fn()` for every gateway and presenter named in its `{ gateways, presenters }` parameter.

The controller calls the factory the way the existing controller already does: through a module-level `const x = create<Concept>Usecase(…)` (as `todoController.ts` does with `todoUsecase`), a `const buildX = (): … => create<Concept>Usecase(…)`, or a copy of an existing `create<Concept>Usecase(…)` call and its arguments, in that order; with none of these, a factory without parameters is called as `create<Concept>Usecase()`. A call is copied only when it uses no parameter or local of its handler other than `request` and no `await`: a call that binds `context.params` through a curried gateway stays in its own handler. When a factory with gateways is called only that way, build it once at module level or through `const buildX = (): … => create<Concept>Usecase(…)` first.

## When It Writes Nothing

The generator checks everything before it writes anything. It exits with a non-zero code, prints the reasons, and writes nothing when:

- an argument is missing (without a terminal) or has the wrong form, including a `path` that does not start with `/api/` or repeats a dynamic segment name, and an `action` that starts with `delete` or `read` or contains the concept's name
- `usecase.ts` has no `export const create<Concept>Usecase`, or the factory is not an arrow function
- the factory's return type is not written as an object type (`{ … }`), for example a named type alias
- the factory does not return an object literal (`=> ({ … })` or a final `return { … };`)
- the factory takes parameters that are not a destructured `{ gateways, presenters }` with object types
- the factory already has an operation with that name
- the factory takes gateways but the controller has no call to it, so the generator cannot tell which gateways to pass; call the factory once in the controller by hand, then run the generator again
- the factory takes gateways and every call to it in the controller uses its handler's parameters or locals (such as `context`) or `await`; build the usecase at module level or through `const buildX = (): … => …` first
- `endpoints.ts` already defines the endpoint, the controller already defines the handler, or `route.ts` already exports the method
- an existing `route.ts` has anything other than `export { … } from '@/controllers/…';` statements (`import` plus `export const GET = handler;` is rejected by ESLint's `unicorn/prefer-export-from`, so the generator does not write or extend that form)
- `src/app/api` already has a directory at the same position with a differently named dynamic segment (an existing `[id]` conflicts with a new `{todoId}`, because Next.js requires every dynamic segment at one position to share one name)

## After Generating

Fill in the content:

- the input and output schemas in `endpoints.ts`, using the entity schemas from `src/entities/` (`.claude/rules/api.md`, `.claude/rules/entities.md`)
- the operation's logic in `usecase.ts`, adding gateway types under `src/usecases/<concept>/gateways/` and their implementations in `src/gateways/` when it needs I/O (`.claude/rules/usecases.md`, `.claude/rules/gateways.md`), and passing the gateways from the controller — once the factory takes gateways, build it once at module level in the controller as `todoController.ts` does
- the `ApiFailure` kinds the operation returns, from `src/entities/apiFailure.ts`
- the tests, replacing the ones that expect the 「この機能はまだ実装されていません」 failure: branches in `usecase.test.ts`, and one representative path per handler in the controller test, with the gateway modules mocked by `vi.mock` (`.claude/rules/controllers.md`, `.claude/rules/test-standards.md`)
- a `*.db.test.ts` for any new gateway that queries the database (`pnpm test:db`)

Editing the generated files under `src/` is subject to the design-baseline gate (`/setup-theme`, AGENTS.md's Design System Setup); the generator itself writes through the file system and is not blocked by it.

A screen that calls the endpoint is added with the `add-web-screen` skill.
