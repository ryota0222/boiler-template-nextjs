---
description: Rules for how the system answers — toasts, error banners, loading, modals, and confirmation dialogs
paths:
  [
    'src/app/**/*.tsx',
    'src/features/**/*.tsx',
    'src/shared-components/**/*.tsx',
    'packages/ui/src/blocks/**/*.tsx',
  ]
---

# Feedback

`design-states.md` says which states a screen must cover. This file says how the system answers a
particular action. The wording of every message in here follows `design-copy.md`, and whether the
message is announced at all is `design-a11y.md`.

## Success Is a Toast, and It Disappears

- **Type**: MUST
- **Reason**: A confirmation that must be dismissed makes the user acknowledge their own success.

Bottom-right, auto-dismissing after 3 seconds. One sentence naming the object and what happened:
`注文 #1024 を登録しました`.

Use `@mantine/notifications` (`notifications.show` with `position: "bottom-right"` and
`autoClose: 3000`). It defaults every notification to `role="alert"`, so a success toast passes
`role: "status"` (`design-a11y.md`). `Notifications` is mounted once in the root layout
(`app/layout.tsx`), so a screen only calls `notifications.show`.

Do not put a toast where the screen already shows the result. Navigating to the single-object
screen of the record you just created is itself the confirmation; the toast only adds the verb.

## A Failure the User Cannot Fix Is a Banner

- **Type**: MUST
- **Reason**: A failed request has no field to attach itself to, and it must survive long enough
  to be read and acted on.

An `Alert` pinned at the top of the content, `color="red"` and `variant="light"` with an `icon`,
stating cause and next step, and carrying the action that retries. It stays until the condition
changes, so it has no close button.

A button inside the banner is `variant="default"`, as `ErrorBanner` renders it. `outline` and
`light` take the accent, and an accent-coloured control on a red surface reads as a clash rather
than as the next step.

Field-level problems are not banners — they belong under the field (`design-form.md`).

## Loading Preserves the Layout and Blocks the Second Click

- **Type**: MUST
- **Reason**: A spinner on a blank page moves everything when data arrives, and a live button
  during a mutation gets pressed twice.

| Scope                                  | Treatment                                                                                                                                                                                                        |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Whole screen                           | `Skeleton` at the dimensions the loaded content will have                                                                                                                                                        |
| Authentication screen (under `(auth)`) | `AuthenticationLoading`: a centered `Loader`; the screen is a single small card that `AuthenticationLayout` re-centers, so a centered spinner shifts little                                                      |
| A single action                        | The button is `disabled`, a small `Loader` sits in its `leftSection`, and its label switches to the progressive form (`保存しています…`); never the `loading` prop, which hides the label behind a bare `Loader` |

The whole-screen case is what `loading.tsx` renders (`design-states.md`).

## LLM Work Shows the Thinking Orb, Waiting Shows a Loader

- **Type**: MUST
- **Reason**: Waiting for an LLM to think or write takes seconds to minutes and is the product working, while waiting for a request or a server is plumbing. When both show the same spinner, the reader cannot tell that the AI is doing something for them.

While an LLM is thinking or producing something — a chat reply, a summary, a generated draft — show the thinking orb next to a progressive line of `ShimmerText` (`ThinkingIndicator`, or `ThinkingOrbIcon` beside the line). Everything else that waits — a submitting button, a reload, a server starting — keeps Mantine's `Loader`. In a chat, the orb takes the place of the assistant's ✦ while the reply is being written. The orb is `thinking-orbs` behind `ThinkingOrbIcon` (`src/shared-components/thinking-orb-icon/`), fixed to one state and theme, at 20px beside a line or 64px in the middle of an empty region that the LLM is filling; never import `thinking-orbs` anywhere else.

## A Modal Is Allowed Under Three Conditions

- **Type**: MUST
- **Reason**: A modal cannot be linked to, cannot be reloaded, and hides the screen behind it. It
  is worth that cost only for something short and self-contained.

All three must hold: five inputs or fewer, finishable in one sitting, and needing nothing from
another screen. Otherwise it is a page.

In one feature, do not mix a modal and a page for the same job — this is the list / detail / edit
chain `design-ooui.md` requires.

## A Modal Puts Close on the Left and the Action on the Right

- **Type**: MUST

Close or cancel on the left, the confirming action on the right and coloured. A dimmed overlay
behind. `Esc` and a click on the overlay both close it, and closing is never confirmed.

Use `Modal`, never a hand-built overlay — it traps focus, restores it to the trigger on close, and
closes on Escape and on an overlay click by default (`design-a11y.md`). Pass
`withCloseButton={false}`: the footer's close button and Escape already close it, and the header's
`×` would otherwise be the first thing to receive focus.

Focus moves into the dialog on open, to the first input, or to the close button when there is
nothing to type — the least destructive control. That is the element Mantine's focus trap picks by
itself once the header's `×` is gone, so no `data-autofocus` is needed (TSX rejects `data-*`).

## Creating, Committing, and Deleting Are Confirmed

- **Type**: MUST
- **Reason**: These are the actions whose effect leaves the screen — a stored record, a document
  sent to a counterparty, a row that no longer exists.

The dialog restates what will happen in the values the user cares about: the object, the amounts,
the count for a bulk action, the dates that will be fixed. The confirming button repeats the
action (`削除する`, `発送する`) and never says `OK` (`design-copy.md`).

Cancel and close run immediately, with no confirmation of their own.

## Deletion Is Reversible by Default, and Irreversibility Is a Decision

- **Type**: MUST
- **Reason**: A delete that cannot be undone turns a mis-click into data loss. Reversibility is
  cheap to design in and expensive to add later, because it lands in the data model rather than in
  the screen.

Prefer an undo window or a soft delete. Choosing physical deletion is allowed, but it is a recorded
decision with a reason — not a default that happens because nobody raised it.

This rule cannot be satisfied by the screen alone. Settle it with whoever owns the data model
before the delete button is built.

## A Delete Dialog States What Cannot Be Undone

- **Type**: MUST

Three facts: which record, whether the deletion is physical or reversible, and whether it can be
restored.

```text
この操作は取り消せません
削除したデータは保持しません。削除すると元に戻せません。
注文番号  #1024     注文日  2026/03/14     合計  ¥6,036
[キャンセル]  [削除する]
```

## A Referenced Record Refuses Deletion and Says by What

- **Type**: MUST
- **Reason**: "Cannot delete" without the reason leaves the user guessing which of the references
  to clear.

Name the count and the kind of the referring records, and offer the route to them. This is the
error-recovery rule of `design-copy.md` applied to the one case where the user's next action is on
a different screen.

```text
注文2件から参照されています
削除すると、その注文から配送先が失われます。先に対象の注文を削除してから、顧客を削除してください。
[閉じる]  [注文を確認する]
```
