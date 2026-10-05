---
description: Rules for covering UI states (UI Stack) and content conditions in pages and components
paths:
  [
    'src/app/**/*.tsx',
    'src/features/**/*.tsx',
    'src/shared-components/**/*.tsx',
    'packages/ui/src/blocks/**/*.tsx',
  ]
---

# UI State Rules

## Two Orthogonal Axes

State and content are separate axes and must be covered independently. A screen in the Ideal state still breaks with long text; a Loading state still breaks with many items. Never collapse the two into a single flat checklist.

## Axis 1: UI Stack

| State     | Definition                                                                | App Router file |
| --------- | ------------------------------------------------------------------------- | --------------- |
| Ideal     | Sufficient data, everything works                                         | `page.tsx`      |
| Empty     | The resource exists but holds nothing, or a search returned nothing       | `page.tsx`      |
| Partial   | Data exists but is sparse — enough to render, not enough to look finished | `page.tsx`      |
| Loading   | Fetching, waiting, or transitioning                                       | `loading.tsx`   |
| Error     | The request failed, validation failed, or the data is invalid             | `error.tsx`     |
| Not Found | The requested resource does not exist                                     | `not-found.tsx` |

### Ideal, Empty, and Partial are the states that get missed

App Router gives Loading, Error, and Not Found their own files, so they are hard to forget. Ideal, Empty, and Partial all live inside `page.tsx` with no file to remind you they exist.

Any component that renders a collection must have an Ideal story and an Empty story. Add a Partial story only when its DOM differs from Ideal — sparse data that renders the same elements gives axe nothing new to check (`stories.md`).

```text
// Good
src/features/order-list/
  OrderList.tsx
  OrderList.stories.tsx   ← Ideal / Empty の2ストーリーを持つ（Partial は DOM が変わるときだけ）
```

### Empty has two causes, and they are different screens

"Your filter matched nothing" and "nothing has been registered yet" lead to opposite next actions. Showing one message for both sends half the users the wrong way.

| Cause                             | Message names   | Action offered          |
| --------------------------------- | --------------- | ----------------------- |
| A filter excluded everything      | The condition   | Clear the conditions    |
| The collection is genuinely empty | What is missing | Create the first record |

Both are the `Empty` state and share the `空の場合` story name. Wording follows `design-copy.md`; the conditions themselves are `design-collection.md`.

### Empty is not Not Found

`Empty` means the resource exists and holds zero items. `Not Found` means the resource itself does not exist. They differ in HTTP status, in copy, and in what the user is expected to do next. Rendering an empty list for a deleted resource hides a broken link from the user.

### Loading must preserve layout

`loading.tsx` renders at the same dimensions as the ideal state. A bare spinner on an otherwise blank page shifts the layout when data arrives. The authentication screens under `(auth)` are the one exception (`design-feedback.md`).

### Error must offer a way forward

`error.tsx` receives a `retry` function from Next.js 16.3 and later, which fetches the segment again before re-rendering it. Always surface `retry` as an action; `reset` only re-renders, so it does not recover from the network and server failures that usually cause the error. An error screen with no next step is a dead end.

## Axis 2: Content Conditions

Independent of state. Apply to whichever states render content.

| Condition       | What breaks                                                         |
| --------------- | ------------------------------------------------------------------- |
| Long text       | Overflow, missing wrapping, broken truncation, collapsed layout     |
| Many items      | Missing scroll container, unbounded height, missing pagination      |
| Minimal content | A single character or single item leaving the layout looking broken |
| Mixed scripts   | Japanese and Latin glyph widths differ; fixed widths break          |

Do not write stories for these: axe cannot detect overflow or broken wrapping, so such a story passes whatever happens. Build the component so that none of them breaks it — that is the rule. They are not UI Stack states and must not be added to the table above.

A horizontal scrollbar belongs to the element that overflows — a table, a diagram, a code block. The page body must never scroll horizontally, at any width down to 320px or at 200% zoom (`design-a11y.md`).

## Story Naming for States

State stories have no corresponding prop, so the naming convention in `stories.md` does not apply. Use `「{状態名}の場合」` with these fixed Japanese names.

| State                  | Story name           | Export name    |
| ---------------------- | -------------------- | -------------- |
| Ideal                  | `理想状態の場合`     | `Ideal`        |
| Empty                  | `空の場合`           | `Empty`        |
| Partial                | `データが少ない場合` | `Partial`      |
| Loading                | `読み込み中の場合`   | `Loading`      |
| Error                  | `エラーの場合`       | `Error`        |
| Not Found              | `存在しない場合`     | `NotFound`     |
| Input validation error | `入力エラーの場合`   | `InvalidInput` |
| Opened overlay         | `開いた場合`         | `Opened`       |

When a component has more than one overlay, name what was opened: `「{対象}を開いた場合」` with the export name `{Target}Opened` (e.g., `表示する列を開いた場合` / `ColumnVisibilityOpened`).

```typescript
export const Empty: Story = {
  args: { orders: [] },
  name: '空の場合',
};
```

## Why Stories Matter Here

Every story is checked by axe through the Storybook a11y gate. A state that has no story is a state whose accessibility is never verified.

The gate checks one component at a time, so it cannot see page-level properties such as heading order across the page or landmarks. axe sees them only when it runs on every page an e2e test visits (`e2e-test-standards.md`), and it reports them as `moderate`, which fails neither gate (`design-a11y.md`).

## A Disabled-Only Story Hides Contrast Failures

axe skips colour-contrast checks on disabled controls. A story whose only interactive element is disabled therefore passes the gate while saying nothing about the enabled appearance — which is the one users actually see.

Give any component with a submit button at least one story where that button is enabled.

```typescript
// Bad: the only story leaves the form empty, so the button is always disabled
export const Ideal: Story = {};

// Good: a story that fills the form and exercises the enabled button
export const Filled: Story = { args: { defaultName: '田中' } };
```
