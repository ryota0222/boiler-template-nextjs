---
description: Rules for making interactive elements recognisable as interactive
paths: ['src/app/**/*.tsx', 'src/features/**/*.tsx', 'src/shared-components/**/*.tsx']
---

# Affordance Rules

An element that can be operated must look operable. This is separate from `design-hierarchy.md`, which decides which of several operable elements comes first. Here the question is whether the user can tell there is anything to press at all. Whether it can be reached without a mouse is `design-a11y.md`.

## Interactivity Never Rests on Colour Alone

- Every interactive element carries at least one cue that is not colour: an underline, a border, a filled background, or an icon.

Colour alone fails for a reader with low vision or colour blindness, and it fails outright when the theme has no chromatic accent. `themeConfig.accentColor` is a decision that can change after the component is written, so a component that depends on the accent for its only cue breaks when the theme is retuned.

This is not hypothetical. A `Link` placed in body text under an accent of `gray` was measured at `rgba(0, 0, 0, 0.608)` with `text-decoration-line: none` — identical to the surrounding paragraph in both colour and decoration. Nothing marked it as a link.

```typescript
// Good: the element is an anchor, and it reads as a control
<Button asChild variant="soft">
  <NextLink href={settingsPath}>設定</NextLink>
</Button>

// Bad: relies on the accent colour, which may be gray
<Link asChild>
  <NextLink href={settingsPath}>設定</NextLink>
</Link>
```

In a table, the cell that opens the record is underlined, not merely coloured. A whole row that responds to a click still needs one cue inside it that says so.

## The Element Follows the Meaning, the Appearance Follows the Role

Navigation renders as `a`, state change renders as `button`. Radix `asChild` keeps the element correct while the appearance is chosen freely, so there is never a reason to swap one for the other to get a look.

An icon-only control has no text node, so it needs an `aria-label`. Without one it is announced as "button" and nothing else.

```typescript
// Good
<IconButton aria-label="共有" variant="soft">
  <Share2 size={18} />
</IconButton>

// Bad: no accessible name
<IconButton variant="soft">
  <Share2 size={18} />
</IconButton>
```

## A Badge Means State, and Nothing Else

A record's current state is always visible on the row and on the single-object screen, as a `Badge` carrying a label. `design-a11y.md` requires the second, non-colour cue; this rule adds which elements are allowed to be badges at all.

A record's kind or category is an attribute, not a state — render it as plain text. When both are badges, the badge stops meaning anything and the row has no state indicator left.

```typescript
// Good: state as a badge, kind as text
<Table.Cell>通常配送</Table.Cell>
<Table.Cell>
  <Badge color="amber">未発送</Badge>
</Table.Cell>

// Bad: the kind competes with the state
<Table.Cell>
  <Badge color="gray">通常配送</Badge>
</Table.Cell>
```

## Editing Context Is Shown Where the Edit Lands

When a form and its result sit side by side, the user must be able to tell which pair they are working in without tracing the layout. Mark the record being edited — a border and a tinted surface on that pair — and move the mark on focus.

Never mark it with colour alone on a wide surface; the border carries it.

## Neither axe Nor the End-to-End Tests Catch This

The accessibility gate inspects roles, names, and contrast. An anchor with an `href` and sufficient contrast against its background passes even when it is indistinguishable from the paragraph around it. `expect(locator).toBeVisible()` passes for the same element — **visible and recognisable as operable are different properties**, and neither gate can tell them apart.

So when a control is added, measure it:

```typescript
const actual = await locator.evaluate((element) => {
  const style = globalThis.getComputedStyle(element);

  return { color: style.color, textDecorationLine: style.textDecorationLine };
});
```

If the result matches the body text in both colour and decoration, the control is invisible as a control no matter what the gates report.
