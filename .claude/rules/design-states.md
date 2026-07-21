---
description: Rules for covering UI states (UI Stack) and content conditions in pages and components
paths: ['src/app/**/*.tsx', 'src/features/**/*.tsx', 'src/shared-components/**/*.tsx']
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

Any component that renders a collection must have a story for all three.

```text
// Good
src/features/order-list/
  OrderList.tsx
  OrderList.stories.tsx   ← Ideal / Empty / Partial の3ストーリーを持つ
```

### Empty is not Not Found

`Empty` means the resource exists and holds zero items. `Not Found` means the resource itself does not exist. They differ in HTTP status, in copy, and in what the user is expected to do next. Rendering an empty list for a deleted resource hides a broken link from the user.

### Loading must preserve layout

`loading.tsx` renders at the same dimensions as the ideal state. A bare spinner on an otherwise blank page shifts the layout when data arrives.

### Error must offer a way forward

`error.tsx` receives a `reset` function from Next.js. Always surface it as an action. An error screen with no next step is a dead end.

## Axis 2: Content Conditions

Independent of state. Apply to whichever states render content.

| Condition       | What breaks                                                         |
| --------------- | ------------------------------------------------------------------- |
| Long text       | Overflow, missing wrapping, broken truncation, collapsed layout     |
| Many items      | Missing scroll container, unbounded height, missing pagination      |
| Minimal content | A single character or single item leaving the layout looking broken |
| Mixed scripts   | Japanese and Latin glyph widths differ; fixed widths break          |

Cover these as additional stories on the component. They are not UI Stack states and must not be added to the table above.

```typescript
export const ChildrenLongText: Story = {
  args: {
    children: '非常に長いラベルが折り返されずにはみ出していないかを確認するための文字列',
  },
  name: 'childrenが長文の場合',
};
```

## Story Naming for States

State stories have no corresponding prop, so the naming convention in `stories.md` does not apply. Use `「{状態名}の場合」` with these fixed Japanese names.

| State     | Story name           | Export name |
| --------- | -------------------- | ----------- |
| Ideal     | `理想状態の場合`     | `Ideal`     |
| Empty     | `空の場合`           | `Empty`     |
| Partial   | `データが少ない場合` | `Partial`   |
| Loading   | `読み込み中の場合`   | `Loading`   |
| Error     | `エラーの場合`       | `Error`     |
| Not Found | `存在しない場合`     | `NotFound`  |

```typescript
export const Empty: Story = {
  args: { orders: [] },
  name: '空の場合',
};
```

## Why Stories Matter Here

Every story is checked by axe through the Storybook a11y gate. A state that has no story is a state whose accessibility is never verified.
