---
description: Rules for input controls, validation, conditional display, and confirming what a form will produce
paths: ['src/app/**/*.tsx', 'src/features/**/*.tsx', 'src/shared-components/**/*.tsx']
---

# Forms and Input

What the messages say is `design-copy.md`. How the system answers a submit is `design-feedback.md`.
This file is about the form itself.

## Submit Is Enabled Only When Dirty and Valid

- **Type**: MUST
- **Reason**: A submit button that is always live invites the user to press it and read the
  failure afterwards. The button state is the cheapest way to say "not yet".

Compare the form against the value it loaded with. When nothing changed, the button stays
disabled and a note says so. When something changed but a field is invalid, the button stays
disabled and the note points at the fields to fix.

```text
変更はまだありません                              → disabled
入力に誤りがあります。赤い説明の項目を直してください → disabled
変更があります                                    → enabled
```

A form whose only story leaves the button disabled hides a contrast failure — `design-states.md`
requires at least one story where it is enabled.

## Do Not Ask For What the Data Already Decides

- **Type**: MUST NOT
- **Reason**: Every control the user must set is a chance to set it wrong, and a value entered
  twice becomes two sources of truth.

Before adding a control, check whether the answer is derivable from records the system already
holds. A field that restates the state of the record the user selected is a derivation wearing a
control's clothes — the selected record decides it, so read it rather than ask for it.

Deleting a control the data can derive removes a group outright, which is the cheapest
restructuring available (`design-hierarchy.md`).

When a derivation rests on an assumption, record the assumption where reviewers see it — in the
design decision, not in a tooltip on the screen.

## The Control Follows the Number of Choices

- **Type**: MUST

| Input                          | Radix component                    |
| ------------------------------ | ---------------------------------- |
| 2–3 choices                    | `RadioGroup`, all visible          |
| 4 or more choices              | `Select`                           |
| Many choices, searched by name | `Dialog` with its own search field |
| Multiple selection             | `Checkbox`                         |
| Long text                      | `TextArea`                         |

Auto-calculated values are not choices. Prefill the field and let the user type over it; the act
of typing records that the value was checked against the source. Offer a way back
(`自動算出に戻す`) rather than a mode switch.

Free-text fields that repeat across records (a category, a person's name) suggest previously
entered values. Suggestion is not validation — do not reject a value that is not in the list.

## Validation Appears Under the Field, on Blur

- **Type**: MUST
- **Reason**: Validating while typing reports an error the user is halfway through fixing.
  Validating only on submit hides which field is wrong.

Fire on focus-out for the field that lost focus, and on submit for everything. Render the message
directly under the field, tie it to the input with `aria-describedby` (`design-a11y.md`), and mark
the field itself so a scan finds it without reading. Wording is cause plus next step
(`design-copy.md`).

Never move focus or scroll to the error on blur; the user knows where they are.

## Required Is Marked, and the Mark Is Not Announced Twice

- **Type**: MUST

A red `＊` after the label, hidden from assistive technology, plus the accessible requirement on
the field itself.

```typescript
// Good: the mark is visual, the requirement is programmatic
<Text as="label" size="1" htmlFor="order-quantity">
  数量
  <Text color="red" aria-hidden>
    ＊
  </Text>
</Text>
<TextField.Root id="order-quantity" required aria-describedby="order-quantity-error" />
```

Conditionally required fields switch the mark with the condition, never leaving a `＊` on a field
that is currently optional.

## Hints Live Behind an Icon, Not in the Flow

- **Type**: MUST
- **Reason**: Text that explains a field is read once and then costs a line forever.

An information icon next to the label, revealing a `Tooltip` on hover and on keyboard focus. The
hint carries what the field means or where its value comes from — not the reason the field exists.

Keep one line of always-visible hint only for a format constraint the user must know before
typing (`半角数字で入力します`, `日付だけを入力できます`).

The icon aligns to the middle of the label text, not to its baseline. In a `Flex` label this is
automatic; anywhere the label is laid out as a grid, wrap the label and icon in an inline flex
container.

## What the State Does Not Use, the Screen Does Not Show

- **Type**: MUST
- **Reason**: A permanently disabled field is a control the user must read, decide is unavailable,
  and skip — for every record of that kind.

| Situation                                               | Treatment                                 |
| ------------------------------------------------------- | ----------------------------------------- |
| The field does not exist for this kind of record        | Hide the whole section                    |
| The field will become available once a condition is met | Disable it, and say what the condition is |

Hiding rather than disabling is also what keeps focus off an inapplicable control
(`design-a11y.md`).

Say once, near the choice that causes it, what the other kind will not use. Do not repeat it on
each hidden section — the sections are gone.

## The Choice That Shapes the Form Comes First

- **Type**: MUST
- **Reason**: If the choice arrives after the inputs it governs, the user fills in fields that are
  about to disappear.

Put the kind, type, or mode selector in the first card. Anything that depends on it — including an
optional intake step such as reading a file — comes after, and only for the kinds that use it.

## Show What the Form Will Produce Before It Is Committed

- **Type**: MUST
- **Reason**: The user is accountable for the result that leaves the building, not for the form
  they typed into.

For a form that produces a document, show the merged result next to the inputs, one pair per
record, updating as the fields change. Where a real rendering is not available, show the values
that will be merged and mark the sample as a sample.

For an edit that changes a stored record, show the changed fields as before → after in the
confirmation dialog. Fields that did not change are not listed.

## File Intake States What It Accepts and What It Filled In

- **Type**: MUST

State the accepted format and reject anything else with a message that names the format. After a
successful read, say how many fields were filled, which field could not be read and why, and offer
one control to discard the result and start over. A field the system filled from a file carries a
mark saying so; a field the user typed does not.

Never let a read overwrite a value the user has already typed without saying that it did.
