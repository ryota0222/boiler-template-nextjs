---
name: add-web-screen
description: Use when adding a screen (page) to this application. Scaffolds the page under src/app/, the screen component with its states, stories, test, and its query or mutation with the `screen` plop generator, then lists what to fill in and connect.
---

# Add a Screen

Start every new screen with the `screen` generator instead of writing its files by hand, so that the files, names, and wiring are the same every time and only the content is left to write. The generator is defined in `plopfile.ts`, with its Handlebars templates in `plop-templates/screen/`. Pass every argument by name after `--`. From a terminal, plop asks for a missing one; without a terminal (an agent's shell, a script), `plopfile.ts` checks before plop asks and exits with code 1 and a message naming the missing arguments, because plop's prompt would otherwise wait for input forever.

```bash
pnpm run generate screen -- --concept inventory-item --kind collection --path /inventory-items
```

| Argument    | Form                                                                                                                                                                                                                                  |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--concept` | kebab-case domain concept, the `src/features/<concept>/` and `src/api/<concept>/` directories (`inventory-item`)                                                                                                                      |
| `--kind`    | `blank`, `collection`, `detail`, or `form`                                                                                                                                                                                            |
| `--path`    | the screen's URL: starts with `/`, not with `/api` (that prefix is the Route Handlers' place); kebab-case segments and `[camelCase]` dynamic segments only, each dynamic name used once (`/inventory-items`, `/inventory-items/[id]`) |

## What It Writes

Every kind writes these files, shown for `--kind collection`:

| File                                                                                             | Contents                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/inventory-items/page.tsx`                                                               | A Server Component that exports `metadata` and renders the screen inside `<main>` and Mantine's `Container`, the same frame as `src/app/page.tsx`                          |
| `src/features/inventory-item/inventory-item-collection-screen/InventoryItemCollectionScreen.tsx` | The `'use client'` screen: `PageHeader` (`@template/ui`, with `next/link` as `linkComponent`), and the loading, error, and empty states (`.claude/rules/design-states.md`) |
| `…/InventoryItemCollectionScreen.stories.tsx`                                                    | One story per state whose DOM differs (`.claude/rules/stories.md`), each checked by axe through the `storybook` Vitest project                                             |
| `…/inventoryItemCollectionScreen.test.tsx`                                                       | Every state the stories show, rendered in jsdom with `renderWithUi`, plus the behaviour they do not reach (retrying, selecting a row, cancelling, submitting)              |
| `src/api/inventory-item/queries.ts` (`form`: `mutations.ts`)                                     | The query (`form`: mutation) the screen calls and its placeholder data type. Created if missing, otherwise appended to, adding only the imports the file lacks             |

| `--kind`     | Screen                                                                                                                                                                                                                                                                                   | Stories                                             | Query or mutation                                                     |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------------------------- |
| `blank`      | The common states only; the loaded items are listed as plain text for you to replace                                                                                                                                                                                                     | Ideal, Empty, Loading, Error                        | `inventoryItemBlankQueryOptions`, `InventoryItemBlankItem[]`          |
| `collection` | `DataTable` with its columns defined at module level through `createDataTableColumnHelper` (`@template/ui/table/dataTableFeatures`), its copy in a module-level `labels` object typed `DataTableLabels`, and `EmptyCollection` for a collection that is genuinely empty (`ui-blocks.md`) | Ideal, RowsSelected, Empty, Loading, Error          | `inventoryItemCollectionQueryOptions`, `InventoryItemCollectionRow[]` |
| `detail`     | `DetailCard`, and a Not Found state for the `not-found` failure kind, apart from the other failures                                                                                                                                                                                      | Ideal, Loading, Error, NotFound                     | `inventoryItemDetailQueryOptions`, `InventoryItemDetail`              |
| `form`       | `FormCard` with one required `名前` field, submit enabled only when changed and valid, and validation on blur (`.claude/rules/design-form.md`) in `inventoryItemFormValidation.ts` and its test; a failed submit shows `ErrorBanner` with a retry                                        | Ideal, Filled (enabled submit), InvalidInput, Error | `inventoryItemFormMutationOptions`, `InventoryItemFormValues`         |

The page's `title` follows `src/app/layout.tsx` (`.claude/rules/page-metadata.md`): the heading alone when `layout.tsx`'s top-level `metadata.title` has a `template`, otherwise the heading followed by `|` and `layout.tsx`'s `title` (today `'Next.js Template'`). The generator refuses to write anything when `layout.tsx`'s `metadata` has no top-level `title` of its own (a nested one such as `openGraph.title` does not count) — it has nothing to derive the page's title from.

A dynamic segment in `--path` becomes the screen's `parameters` prop: the page awaits `params` and passes it down, and the query or mutation options become a function of `parameters`, which it puts in the query or mutation key (`.claude/rules/api.md`). Next.js requires dynamic segments at the same place to share one name; this generator does not check that against existing pages, so keep the names consistent by hand.

The generated files import `ApiFailure` and `Result` from `@/entities/apiFailure` and `@/entities/result`, the blocks from `@template/ui/blocks/…`, and `isDefined` or `isNonNullish` from `remeda` (ESLint's `no-undefined` forbids comparing with `undefined`). They are sorted and formatted like the rest of the code, and pass `pnpm run typecheck`, `pnpm run lint`, `pnpm run lint:text`, `pnpm run depcruise`, and `pnpm test` as they are.

## Connecting the Screen

Until you connect an endpoint, the query and mutation resolve to the `internal` failure 「この画面の API はまだつながっていません」, so the screen shows its error state; nothing fakes data. To connect one:

1. Generate the endpoint with the `api` generator first (the `add-web-api-endpoint` skill), if it does not exist yet.
2. Call `requestEndpoint` with its definition in the generated `queryFn` or `mutationFn` (`.claude/rules/api.md`). A mutation that changes what a query shows invalidates that query's key in `onSettled`, as `src/api/todo/mutations.ts` does (`.claude/rules/state-management.md`).
3. Replace the placeholder data type (`InventoryItemCollectionRow`, and so on) with the endpoint's output type, usually an entity type from `src/entities/`.
4. Update the screen's test so it mocks `fetch` instead of relying on the placeholder failure, and add a test for the query or mutation in `src/api/<concept>/`.

The copy is a placeholder too: it names the object by its kebab-case `--concept` (「inventory-item の一覧」), so replace it with the object's Japanese name, following `.claude/rules/design-copy.md`, in the page's `metadata`, the screen, and its stories and test.

## What the Generated States Stop Short Of

Every story of `blank`, `collection`, and `detail` puts its result into a `QueryClient` whose queries are disabled, so no story calls the `queryFn` or the network; the screen's `.test.tsx` renders each state the same way and also runs the `queryFn` through the retry test. `RowsSelected` selects a row, which calls `selectionActions`; it starts as `() => null` because the screen has no bulk actions yet, so replace it when you add one. `EmptyCollection` gets `filtered={null}` because the screen has no filter conditions of its own; when you add them, pass the `filtered` copy and its `onClear` while a condition is set.

The generated states stop short of where the user goes next, because the generator cannot know the other screens:

- The empty state of `collection` and `blank` offers no action (`action: null` in `collection`). Once a create screen exists, put the action that opens it there (`.claude/rules/design-states.md`)
- The Not Found state of `detail` offers no way back. Add a link to the collection screen once that screen exists; the screen is a `'use client'` component, so it may pass `Link` itself
- `PageHeader` gets `breadcrumbs={[]}` and `primaryAction={null}`. Add the breadcrumbs and the primary action once the screen's place in the menu is decided (`.claude/rules/design-ooui.md`, `.claude/rules/design-layout.md`)
- A failed submit on `form` shows `ErrorBanner`, whose retry sends the values that failed, not what the fields hold now, so an edit made after the failure is never sent without passing validation and the submit button. A successful submit does nothing yet; add the navigation or the toast (`.claude/rules/design-feedback.md`) when the mutation is connected. The form starts empty, as a create form; an edit form must load its initial values itself

The generator does not touch navigation or add an e2e test. Link the screen from wherever the user reaches it, and cover the page with an e2e test (the `create-e2e-test` skill), which also runs the page-level axe check (`.claude/rules/e2e-test-standards.md`).

Before adding or changing a screen, read the rule files in `.claude/rules/` that cover what is being changed (AGENTS.md, Screen Design Rules) — the generator's output is a starting skeleton, not a screen that already satisfies them. Editing the generated files under `src/` is subject to the design-baseline gate (`/setup-theme`, AGENTS.md's Design System Setup); the generator itself writes through the file system and is not blocked by it.

## When It Writes Nothing

The generator checks everything before it writes anything. It exits with a non-zero code and writes nothing when an argument is missing (without a terminal) or has the wrong form, when one of the new files already exists, when a `page.tsx` or `route.ts` directly under `src/app/` or under one of its top-level route groups already answers the same URL (route groups do not appear in the URL, so `(marketing)/about/page.tsx` blocks `--path /about`), when the existing `queries.ts` or `mutations.ts` already defines the name it would add, or when `layout.tsx`'s `metadata` has no top-level `title` to derive the page's `title` from.
