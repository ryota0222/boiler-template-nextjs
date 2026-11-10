---
name: add-web-screen
description: Use when adding a screen (page) to this application. Scaffolds the page under src/app/, the screen component with its states, stories, test, and its query or mutation with the `screen` plop generator, then lists what to fill in and connect.
---

# Add a Screen

Start every new screen with the `screen` generator instead of writing its files by hand, so that the files, names, and wiring are the same every time and only the content is left to write. The generator is defined in `plopfile.ts`, with its Handlebars templates in `plop-templates/screen/`. Pass every argument by name after `--`. From a terminal, plop asks for a missing one; without a terminal (an agent's shell, a script), `plopfile.ts` checks before plop asks and exits with code 1 and a message naming the missing arguments, because plop's prompt would otherwise wait for input forever.

Before generating, pick the screen's recipe in `.claude/rules/design-recipes.md`. Every recipe has a `--kind` that writes its layout, its blocks, and the states the recipe requires, so the blocks are already in place and only the content is left:

| Recipe (`design-recipes.md`) | `--kind`     | Example `--path`          |
| ---------------------------- | ------------ | ------------------------- |
| Collection                   | `collection` | `/inventory-items`        |
| Detail                       | `detail`     | `/inventory-items/[id]`   |
| Form                         | `form`       | `/inventory-items/new`    |
| Split                        | `split`      | `/inventory-items/queue`  |
| Dashboard                    | `dashboard`  | `/overview`               |
| Chat                         | `chat`       | `/assistant`              |
| Task step                    | `task-step`  | `/packing`                |
| Settings                     | `settings`   | `/settings`               |
| None is close                | `blank`      | `/inventory-items/report` |

`blank` writes only the common states. `design-recipes.md` starts even a screen that fits no recipe from the closest recipe, so reach for `blank` only when no recipe is close.

```bash
pnpm run generate screen -- --concept inventory-item --kind collection --path /inventory-items
```

| Argument    | Form                                                                                                                                                                                                                                  |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--concept` | kebab-case domain concept, the `src/features/<concept>/` and `src/api/<concept>/` directories (`inventory-item`)                                                                                                                      |
| `--kind`    | one of the kinds in the table above: `blank`, `collection`, `detail`, `form`, `split`, `dashboard`, `chat`, `task-step`, or `settings`                                                                                                |
| `--path`    | the screen's URL: starts with `/`, not with `/api` (that prefix is the Route Handlers' place); kebab-case segments and `[camelCase]` dynamic segments only, each dynamic name used once (`/inventory-items`, `/inventory-items/[id]`) |

## What It Writes

Every kind writes these files, shown for `--kind collection`:

| File                                                                                             | Contents                                                                                                                                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/inventory-items/page.tsx`                                                               | A Server Component that exports `metadata` and renders the screen inside `<main>` and Mantine's `Container`, the same frame as `src/app/page.tsx`. `split` fills the height below the app's header instead, and `task-step` is not wrapped, because `HandheldLayout` holds its own `main` |
| `src/features/inventory-item/inventory-item-collection-screen/InventoryItemCollectionScreen.tsx` | The `'use client'` screen: `PageHeader` (`@template/ui`, with `next/link` as `linkComponent`), and the loading, error, and empty states (`.claude/rules/design-states.md`)                                                                                                                |
| `…/InventoryItemCollectionScreen.stories.tsx`                                                    | One story per state whose DOM differs (`.claude/rules/stories.md`), each checked by axe through the `storybook` Vitest project                                                                                                                                                            |
| `…/inventoryItemCollectionScreen.test.tsx`                                                       | Every state the stories show, rendered in jsdom with `renderWithUi`, plus the behaviour they do not reach (retrying, selecting a row, cancelling, submitting)                                                                                                                             |
| `src/api/inventory-item/queries.ts` and `mutations.ts`, as the kind needs                        | The query a screen loads with and the mutation it saves or sends with, and their placeholder data types. Created if missing, otherwise appended to, adding only the imports the file lacks                                                                                                |

### What Each Kind Adds

The query and mutation names are shown for `--concept inventory-item`.

#### `blank`

- Screen: the common states only; the loaded items are listed as plain text for you to replace
- Stories: Ideal, Empty, Loading, Error
- API: `inventoryItemBlankQueryOptions`, `InventoryItemBlankItem[]`

#### `collection`

- Screen: filters above the table (`名前で探す` `TextInput`, `DateRangeFilter` for 更新日, `NativeSelect` for 状態) and `DataTable` with `hasSearch={false}`, so the table does not repeat the name filter. The status column is `StatusBadge`, and the updated-at column is `RelativeTime` measured from the time the screen opened. The columns come from `createDataTableColumnHelper` (`@template/ui/table/dataTableFeatures`) inside `useMemo`, and the copy from a module-level `labels` object typed `DataTableLabels` (`ui-blocks.md`). `EmptyCollection` covers a collection that is genuinely empty and, with `filtered`, one the filters emptied
- Stories: Ideal, RowsSelected, Empty, FilteredEmpty, Loading, Error
- API: `inventoryItemCollectionQueryOptions`, `InventoryItemCollectionRow[]`

#### `detail`

- Screen: `DetailCard` with the name as `InlineEdit` (`hasViewingLabel={false}`, so the card's label is not repeated) and the code as `CopyableValue`, and the history as `ActivityTimeline` in a card on the right. Saving the name calls the mutation and answers in place. A Not Found state for the `not-found` failure kind, apart from the other failures
- Stories: Ideal, Saving, SaveFailed, Loading, Error, NotFound
- API: `inventoryItemDetailQueryOptions`, `InventoryItemDetail`; `inventoryItemDetailMutationOptions`, `InventoryItemDetailChanges`

#### `form`

- Screen: `FormCard` with one required `名前` field whose label is `FieldLabel` (the hint behind an icon), submit enabled only when changed and valid, and validation on blur (`.claude/rules/design-form.md`) in `inventoryItemFormValidation.ts` and its test. A failed submit shows `ErrorBanner` with a retry
- Stories: Ideal, Filled (enabled submit), InvalidInput, Error
- API: `inventoryItemFormMutationOptions`, `InventoryItemFormValues`

#### `split`

- Screen: `SplitLayout`. On the left, the page heading, a `名前で探す` filter, and the items as buttons with their `StatusBadge` and how long ago they changed; on the right, the selected item's heading, `StatusBadge`, and `DetailCard`. The right side says when nothing is selected, and when the selected item is gone from a reloaded list
- Stories: Ideal (nothing selected), Selected, SelectedGone, Empty, Loading, Error
- API: `inventoryItemSplitQueryOptions`, `InventoryItemSplitItem[]`

#### `dashboard`

- Screen: `StatsGrid` whose values are `MetricValue` (the unit smaller than the number), and two cards: 進み具合 with `SegmentedProgress` and 最近の動き with `ActivityTimeline`. While loading, every card keeps its place with a `Skeleton` of its own size; a card with no data stays and says so
- Stories: Ideal, NoData, Loading, Error
- API: `inventoryItemDashboardQueryOptions`, `InventoryItemDashboard`

#### `chat`

- Screen: the conversation as `ChatMessage`s in a `role="log"` region, and `ChatComposer` below it. While the reply is written, an assistant `ChatMessage` with `isWriting` shows the orb in place of ✦ beside a `ShimmerText` line (`design-feedback.md`); `ThinkingIndicator` is the same orb and line for places outside a conversation. A failed reply shows `ErrorBanner`, whose retry sends the same question again
- Stories: Empty, Writing, Error
- API: `inventoryItemChatMutationOptions`, `InventoryItemChatRequest`, `InventoryItemChatReply`

#### `task-step`

- Screen: `HandheldLayout` with a barcode field (a reader types the code and Enter), the scanned code as `MetricValue` inside `ResultCard`, and one full-width button fixed at the bottom. The code shows at once; the band answers pending, success, failure, or offline, and `HandheldLayout`'s `OfflineBanner` shows while the browser is offline
- Stories: Ideal (waiting for a scan), Pending, Failure, Offline
- API: `inventoryItemTaskStepMutationOptions`, `InventoryItemTaskStepScan`, `InventoryItemTaskStepCheck`

#### `settings`

- Screen: `SettingsLayout` with three groups in its menu, the screen itself and two placeholders under `--path`. The content is 基本の情報 with the name as `InlineEdit`, お知らせ with a `Checkbox` saved on change (its failure under the checkbox), and at the end a subtle red delete button that opens `ConfirmModal`
- Stories: Ideal, Saving, SaveFailed, DeletionOpened, Loading, Error
- API: `inventoryItemSettingsQueryOptions`, `InventoryItemSettings`; `inventoryItemSettingsMutationOptions`, `InventoryItemSettingsChanges`

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

Every story that shows loaded data puts its result into a `QueryClient` whose queries are disabled, so no story calls the `queryFn` or the network; the screen's `.test.tsx` renders each state the same way and also runs the `queryFn` through the retry test. A story that waits for a mutation (Saving, Writing, Pending) calls `onlineManager.setOnline(false)` in `beforeEach`, because TanStack Query holds a mutation back while it believes it is offline, and restores it afterwards; `task-step`'s Offline story sends the window an `offline` event instead, which both `useNetwork` and `onlineManager` hear.

Until a mutation is connected it always fails, so the states that follow a success cannot be reached from the screen: the saved name of `detail` and `settings`, `chat`'s reply, and `task-step`'s success band. `InlineEdit`'s and `ResultCard`'s own stories cover how those look; add a story to the screen once the mutation returns a success.

`RowsSelected` selects a row, which calls `selectionActions`; it starts as `() => null` because the screen has no bulk actions yet, so replace it when you add one. `collection` and `split` filter the loaded rows in the browser; once the endpoint filters on the server, move the conditions into the query key instead.

The generated states stop short of where the user goes next, because the generator cannot know the other screens:

- The empty state of `collection`, `split`, and `blank` offers no action (`action: null` in `collection`). Once a create screen exists, put the action that opens it there (`.claude/rules/design-states.md`)
- The Not Found state of `detail` offers no way back. Add a link to the collection screen once that screen exists; the screen is a `'use client'` component, so it may pass `Link` itself
- `PageHeader` gets `breadcrumbs={[]}` and `primaryAction={null}`. Add the breadcrumbs and the primary action once the screen's place in the menu is decided (`.claude/rules/design-ooui.md`, `.claude/rules/design-layout.md`)
- A failed submit on `form` shows `ErrorBanner`, whose retry sends the values that failed, not what the fields hold now, so an edit made after the failure is never sent without passing validation and the submit button. A successful submit does nothing yet; add the navigation or the toast (`.claude/rules/design-feedback.md`) when the mutation is connected. The form starts empty, as a create form; an edit form must load its initial values itself
- `split` keeps the selection in the screen's state, so a reload or a shared link loses it. Move it into the URL (a search parameter or a `[id]` segment) when the selection must survive
- Every card of `dashboard` shows numbers without linking anywhere. Link each card to the screen where the user acts on it, or drop the card (`design-recipes.md`, A Dashboard Earns Its Place)
- `chat` keeps the conversation in the screen's state, so a reload starts it over. Load and save it through the API when the conversation must last
- `task-step`'s next button is enabled whenever a result shows, including a failure. Disable it on a failure if the work must not move on, and add `progress` and `menu` to `HandheldLayout` (`SegmentedProgress` for how far the task has come)
- The two other groups in `settings`' menu (`/members`, `/integrations`) lead nowhere until those screens exist; rename or replace them. Confirming the deletion only closes `ConfirmModal` until a delete mutation is connected (`design-feedback.md`, Deletion Is Reversible by Default)

The generator does not touch navigation or add an e2e test. Link the screen from wherever the user reaches it, and cover the page with an e2e test (the `create-e2e-test` skill), which also runs the page-level axe check (`.claude/rules/e2e-test-standards.md`).

Before adding or changing a screen, read the rule files in `.claude/rules/` that cover what is being changed (AGENTS.md, Screen Design Rules) — the generator's output is a starting skeleton, not a screen that already satisfies them. Editing the generated files under `src/` is subject to the design-baseline gate (`/setup-theme`, AGENTS.md's Design System Setup); the generator itself writes through the file system and is not blocked by it.

## When It Writes Nothing

The generator checks everything before it writes anything. It exits with a non-zero code and writes nothing when an argument is missing (without a terminal) or has the wrong form, when one of the new files already exists, when a `page.tsx` or `route.ts` directly under `src/app/` or under one of its top-level route groups already answers the same URL (route groups do not appear in the URL, so `(marketing)/about/page.tsx` blocks `--path /about`), when the existing `queries.ts` or `mutations.ts` already defines the name it would add, or when `layout.tsx`'s `metadata` has no top-level `title` to derive the page's `title` from.
