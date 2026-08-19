---
description: Rules for ordering and grouping controls so a screen states what to do next
paths: ['src/app/**/*.tsx', 'src/features/**/*.tsx']
---

# Visual Hierarchy Rules

A screen must answer "what do I press now" without being read end to end. `design-affordance.md` decides whether an element looks operable at all; this file decides which operable element wins. Where blocks sit and what the token values are is `design-layout.md`.

## Exactly One Emphasised Control at a Time

- **Type**: MUST
- **Reason**: Two controls with the same weight means the screen has no opinion. The user resolves the ambiguity by reading everything, which is the cost the emphasis was supposed to remove.

### Details

One `solid` control per screen state. Everything else is `outline`, `soft`, or `ghost`. When the state changes, the emphasis moves rather than multiplying.

```typescript
// Good: the emphasis follows the state
{isSubmitted ? <Button>次へ</Button> : <Button disabled={!isValid}>送信</Button>}

// Bad: two solid controls competing on the same screen
<Button>アカウントを作成</Button>
<Button>送信</Button>
```

A selected state may also render `solid` — a chosen card, an active tab. That is a state indicator, not a second action, and it is allowed.

The emphasis moves with the selection, too. When rows are selected on a collection, the bulk action becomes the screen's `solid` control and the header's primary action steps back to `outline` — the screen's opinion changed, so its emphasis did (`design-collection.md`).

## Colour Maps to Importance, and the Map Is Fixed

- **Type**: MUST
- **Reason**: The weights only carry information while each one means one thing. A screen that picks a variant for its looks spends the vocabulary the next screen needs.

### Details

| Weight                     | Use                                                 | Count per screen        |
| -------------------------- | --------------------------------------------------- | ----------------------- |
| `solid` in the accent      | Commit, register, submit                            | 1                       |
| `outline`                  | Cancel, secondary navigation, export                | Any                     |
| `soft`                     | An alternative to outline where the surface is busy | Any                     |
| `ghost`                    | Return, dismiss, and destructive actions            | Any                     |
| `solid` with `color="red"` | Destructive confirmation inside a dialog            | 1, and only in a dialog |

Destructive actions on a screen are `ghost` with red text, not red fills. The red fill is reserved for the confirming button in the `AlertDialog`, where it is the only action (`design-feedback.md`).

## Size and Placement Follow the Container

- **Type**: MUST
- **Reason**: A button's size is information about where the user is. When a table-row action and a form's submit are the same size, neither reads as belonging to its container.

### Details

| Container                            | `size` |
| ------------------------------------ | ------ |
| Inside a table row, inline with text | `1`    |
| Page header, card header             | `2`    |
| Form footer, dialog footer           | `3`    |

`design-a11y.md` sets the floor these sizes must clear, and an icon-only control is bound by that floor rather than by this table.

The primary action sits at the right end of its row. A control that discards work sits at the opposite end.

## Buttons Are a Shared Component

- **Type**: MUST
- **Reason**: The weights above are only readable if they mean the same thing on every screen. A locally styled button is a fourth weight nobody defined.

### Details

Radix `Button` and `IconButton` are used directly, with no wrapper (`shared-components.md`). What must not vary is the pairing: the same operation keeps the same label, variant, size, and icon across screens — `PDFをダウンロード` is not `ダウンロード` on the next screen.

When a screen needs a look the variants do not offer, that is a signal to re-read the table above, not to write a style.

## Management Controls Do Not Live in the Content Flow

- **Type**: MUST NOT
- **Reason**: Sharing, settings, and account actions are used once per session at most. Placed in the flow they occupy the top of the screen and take emphasis away from the thing the screen exists for.

### Details

Put them in a header row or behind a popover. What remains in the flow is what the user came to do.

```text
// Good
┌──────────────────────────────────────┐
│ 対象の名前 / 所属          [共有] [⚙] │
├──────────────────────────────────────┤
│ 一覧                                  │
│ 入力                                  │
│ 送信              3 / 4 件   取り消す  │
└──────────────────────────────────────┘

// Bad: three management blocks stacked above the actual task
アカウント連携の案内 + ボタン
設定へのリンク
共有URLの入力欄 + コピーボタン
一覧
入力
```

## Undo and Destructive Actions Are Separated from the Primary Action

- **Type**: MUST
- **Reason**: Adjacency invites the mis-click, and these are the actions where a mis-click costs the most.

### Details

Place them apart spatially and give them the weakest weight the screen has. An action that discards work the user has already done sits at the opposite end of the row from the primary control and renders as `ghost`.

## Grouping Comes from Structure, Not from Uniform Gaps

- **Type**: MUST
- **Reason**: A single column with one gap value gives every boundary the same strength, so no boundary reads as a boundary. The screen becomes a list of unrelated blocks.

### Details

Express a group by putting it in one row or one container, and vary the gap between groups and within them. Information with the same meaning goes in the same block; different functions are visually separated. If a screen is a single `Flex direction="column"` with one `gap`, it has no grouping.

When one record needs both its input and its result, pair them side by side within one container per record — not as two panels the user must mentally join.

The gap between groups is at least twice the gap within a group. Below that ratio the difference reads as an inconsistency rather than as a boundary, which is worse than a uniform gap.

Radix spacing is not linear, so doubling the `gap` number does not double the space. Read the pair off this table instead:

| Gap within a group | Gap between groups |
| ------------------ | ------------------ |
| `gap="1"` (4px)    | `gap="2"` (8px)    |
| `gap="2"` (8px)    | `gap="4"` (16px)   |
| `gap="3"` (12px)   | `gap="5"` (24px)   |
| `gap="4"` (16px)   | `gap="6"` (32px)   |
| `gap="5"` (24px)   | `gap="8"` (48px)   |

```typescript
// Good: 8px within the group, 16px between groups
<Flex direction="column" gap="4">
  <Flex direction="column" gap="2">
    <Heading size="3">配送先</Heading>
    <Text>東京都渋谷区</Text>
  </Flex>
  <Flex direction="column" gap="2">
    <Heading size="3">支払い方法</Heading>
    <Text>クレジットカード</Text>
  </Flex>
</Flex>

// Bad: gap="3" against gap="2" is a 1.5x difference, which reads as a mistake
<Flex direction="column" gap="3">
  <Flex direction="column" gap="2">
```

## Count the Controls

- **Type**: MUST
- **Reason**: The count is the cheapest measure of whether the hierarchy holds, and it can be taken from a screenshot before anyone argues about taste.

### Details

Count the operable elements on the screen, treating a set of same-purpose items (a card deck, a tab bar, a column of row checkboxes) as one. Past roughly seven groups, the screen needs restructuring rather than restyling.

Record the count in the commit message when a screen is restructured, so the next change can be compared against it. Moving management controls into a header and collapsing a share form into a popover typically removes several groups at once. Deleting a control the data can derive removes a group outright, which is the cheapest restructuring available (`design-form.md`).
