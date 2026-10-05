---
description: Rules for where blocks sit on a screen, and for the spacing, type, and colour values they are built from
paths:
  [
    'src/app/**/*.tsx',
    'src/features/**/*.tsx',
    'src/shared-components/**/*.tsx',
    'packages/ui/src/blocks/**/*.tsx',
  ]
---

# Layout and Tokens

`design-hierarchy.md` decides which control wins. This file decides where blocks sit and what
values the surfaces are built from, so two screens built months apart still look like one system.
How surfaces stack — the page, cards, and embedded previews — is `design-surface.md`. Which icons
to use and where is `design-icon.md`.

Mantine owns the token scales themselves, and `@template/ui`'s `createAppTheme` sets the accent and
the radius per app. What this file adds is which token to reach for, and the ordering decisions
Mantine has no opinion about.

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

A top-level screen — one the navigation opens directly, with no segment above it — has no
breadcrumb. It would only repeat the title, and the navigation's current item already marks the
location. `PageHeader` omits the breadcrumb when `breadcrumbs` is empty.

```text
注文 > 注文 #1024 > 編集
```

## Spacing Comes From the Mantine Spacing Scale

- **Type**: MUST
- **Reason**: Ad-hoc pixel values accumulate into boundaries of every strength, which is the
  failure `design-hierarchy.md` describes as a screen with no grouping.

Use the `gap`, `p`, `m` props with a size key, or `var(--mantine-spacing-<key>)` in CSS. Never
write a raw pixel value for spacing. In Mantine 9.6.2 the scale is `xs` 10px, `sm` 12px, `md` 16px,
`lg` 20px, and `xl` 32px, multiplied by `--mantine-scale`.

| Distance                  | Token                  |
| ------------------------- | ---------------------- |
| Between fields in a group | `xs`–`md` (10–16px)    |
| Between sections          | `lg`–`xl` (20–32px)    |
| `Card` padding            | `md` (16px, `padding`) |

The ratio between "within a group" and "between groups" is a hierarchy decision, and the pair table
lives in `design-hierarchy.md`.

## Type Comes From the Mantine Size Scale, and Four Sizes Are Enough

- **Type**: MUST

| Role                      | Component                   | Size |
| ------------------------- | --------------------------- | ---- |
| Page heading              | `Title order={1} size="h3"` | 22px |
| Card heading              | `Title order={2} size="h5"` | 16px |
| Body, inputs, table cells | `Text size="sm"`            | 14px |
| Note, hint, label, badge  | `Text size="xs"`            | 12px |

`order` is the heading level the document outline needs; `size` is how large it looks, so the two
are set independently. `Text` defaults to `md` (16px), which is not one of the four — pass `size`
explicitly. Inputs, `Table`, and `Button` default to `sm` already.

Line height comes with the size token — do not override it. Columns of numbers take
`font-variant-numeric: tabular-nums` so the digits align; `Table` does this with `tabularNums`.

Do not introduce a fifth size to make something look important. Move it up a level or change its
weight.

## Colour Carries Meaning, and the Meaning Is Fixed

- **Type**: MUST
- **Reason**: A palette where blue sometimes means "normal" and sometimes means "selected" cannot
  be read at a glance, and it cannot be checked.

| Mantine colour                                                | Meaning                           |
| ------------------------------------------------------------- | --------------------------------- |
| `accent` (the primary colour from `themeConfig.accentColors`) | Normal, primary, current location |
| `green`                                                       | Success, completed                |
| `orange`                                                      | Warning, needs attention          |
| `red`                                                         | Danger, error, overdue            |
| `gray`                                                        | Neutral, disabled, boundaries     |

Never write a raw hex value in a component. Take the value from a Mantine colour shade, through a
component prop (`color="red"`, `c="gray.7"`) or `var(--mantine-color-<colour>-<shade>)`.

Mantine colours have ten shades, `0` (lightest) to `9` (darkest). Which shades may carry text is not
a property of the shade number — Mantine's default `green` and `orange` fail WCAG AA as text in every
shade — so the permitted pairs are measured and listed in `design-a11y.md`.
