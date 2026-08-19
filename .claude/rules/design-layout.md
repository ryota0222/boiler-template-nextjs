---
description: Rules for where blocks sit on a screen, and for the spacing, type, colour, and icon values they are built from
paths: ['src/app/**/*.tsx', 'src/features/**/*.tsx', 'src/shared-components/**/*.tsx']
---

# Layout and Tokens

`design-hierarchy.md` decides which control wins. This file decides where blocks sit and what
values the surfaces are built from, so two screens built months apart still look like one system.

Radix Themes owns the token scales themselves. What this file adds is which token to reach for, and
the ordering decisions Radix has no opinion about.

## A Collection Screen Has a Fixed Order

- **Type**: MUST
- **Reason**: A reader who learns the order once stops hunting for the search box. Reordering it
  per screen spends their attention on navigation instead of on the data.

Header (title, note, primary action) → search and filters → file input/output row → table.
The primary action sits in the header, not above the table. How the search and filter row behaves
is `design-collection.md`.

## A Single-Object Screen Has a Fixed Order

- **Type**: MUST

Summary → main cards → bottom button row. The summary carries the few values that identify the
record and its state; everything else belongs in a `Card`.

## Show the Current Location on Every Screen

- **Type**: MUST
- **Reason**: A screen reached from a link, a toast, or a pasted URL must say where it is without
  the user reconstructing the path.

A title and a breadcrumb, both present. Breadcrumb segments above the current one are links; the
current segment carries `aria-current="page"` and is not a link. The breadcrumb's root is the
collection, named exactly as the navigation names it (`design-ooui.md`).

```text
注文 > 注文 #1024 > 編集
```

## Spacing Comes From the Radix Space Scale

- **Type**: MUST
- **Reason**: Ad-hoc pixel values accumulate into boundaries of every strength, which is the
  failure `design-hierarchy.md` describes as a screen with no grouping.

Use the `gap`, `p`, `m` props, or `var(--space-N)` in CSS. Never write a raw pixel value for
spacing. In Radix Themes 3.3.0 the scale is `--space-1` 4px through `--space-9` 64px, multiplied by
`--scaling`.

| Distance                  | Token             |
| ------------------------- | ----------------- |
| Between fields in a group | `2`–`4` (8–16px)  |
| Between sections          | `4`–`5` (16–24px) |
| `Card` padding            | `4` (16px)        |

The ratio between "within a group" and "between groups" is a hierarchy decision, and the pair table
lives in `design-hierarchy.md`.

## Type Comes From the Radix Size Scale, and Four Sizes Are Enough

- **Type**: MUST

| Role                      | Component | `size`     |
| ------------------------- | --------- | ---------- |
| Page heading              | `Heading` | `5` (20px) |
| Card heading              | `Heading` | `3` (16px) |
| Body, inputs, table cells | `Text`    | `2` (14px) |
| Note, hint, label, badge  | `Text`    | `1` (12px) |

Line height comes with the size token — do not override it. Columns of numbers take
`font-variant-numeric: tabular-nums` so the digits align.

Do not introduce a fifth size to make something look important. Move it up a level or change its
weight.

## Colour Carries Meaning, and the Meaning Is Fixed

- **Type**: MUST
- **Reason**: A palette where blue sometimes means "normal" and sometimes means "selected" cannot
  be read at a glance, and it cannot be checked.

| Radix colour                              | Meaning                           |
| ----------------------------------------- | --------------------------------- |
| The accent from `themeConfig.accentColor` | Normal, primary, current location |
| `green`                                   | Success, completed                |
| `amber`                                   | Warning, needs attention          |
| `red`                                     | Danger, error, overdue            |
| `gray`                                    | Neutral, disabled, boundaries     |

Never write a raw hex value in a component. Take the value from a Radix Colors step, through a
component prop or `var(--<colour>-N)`.

Step usage that matters: step 3 for a tinted surface, step 6 for its border, step 11 for text on
white, step 12 for text on a step-3 surface, step 9 only where no text sits on it. The contrast this
produces is checked in `design-a11y.md`, which also records the two pairs that fail.

## One Icon Set

- **Type**: MUST
- **Reason**: Two sets differ in stroke weight and corner radius, and the difference reads as an
  error rather than as variety.

`lucide-react` is the set, because Radix Themes ships no icons. One size grid and one stroke width
across the application. The same meaning always gets the same glyph, and no glyph is reused for two
meanings.

An icon never appears without either a text label next to it or an `aria-label` on the control
(`design-a11y.md`). A decorative icon is hidden from assistive technology instead.
