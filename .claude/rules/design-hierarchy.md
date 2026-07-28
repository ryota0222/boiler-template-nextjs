---
description: Rules for ordering and grouping controls so a screen states what to do next
paths: ['src/app/**/*.tsx', 'src/features/**/*.tsx']
---

# Visual Hierarchy Rules

A screen must answer "what do I press now" without being read end to end. `design-affordance.md` decides whether an element looks operable at all; this file decides which operable element wins.

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

Express a group by putting it in one row or one container, and vary the gap between groups and within them. If a screen is a single `Flex direction="column"` with one `gap`, it has no grouping.

## Count the Controls

- **Type**: MUST
- **Reason**: The count is the cheapest measure of whether the hierarchy holds, and it can be taken from a screenshot before anyone argues about taste.

### Details

Count the operable elements on the screen, treating a set of same-purpose items (a card deck, a tab bar) as one. Past roughly seven groups, the screen needs restructuring rather than restyling.

Record the count in the commit message when a screen is restructured, so the next change can be compared against it. Moving management controls into a header and collapsing a share form into a popover typically removes several groups at once.
