---
description: Rules for making interactive elements recognisable as interactive
paths:
  [
    'src/app/**/*.tsx',
    'src/features/**/*.tsx',
    'src/shared-components/**/*.tsx',
    'packages/ui/src/blocks/**/*.tsx',
  ]
---

# Affordance Rules

An element that can be operated must look operable. This is separate from `design-hierarchy.md`, which decides which of several operable elements comes first. Here the question is whether the user can tell there is anything to press at all. Whether it can be reached without a mouse is `design-a11y.md`.

## Interactivity Never Rests on Colour Alone

- Every interactive element carries at least one cue that is not colour: an underline, a border, a filled background, or an icon.

Colour alone fails for a reader with low vision or colour blindness, and it fails outright when the theme has no chromatic accent. `themeConfig.accentColors` is a per-app decision that can change after the component is written, so a component that depends on the accent for its only cue breaks when the theme is retuned.

This is not hypothetical. Mantine's `Anchor` defaults to `underline="hover"`, so a link in body text is marked by colour alone until the pointer happens to rest on it — and a keyboard or touch user never hovers. Under a gray accent it is identical to the surrounding paragraph. An `Anchor` therefore always takes `underline="always"`.

```typescript
// Good: the element is an anchor, and it reads as a control
<Anchor component={NextLink} href={settingsPath} underline="always">
  設定
</Anchor>

// Bad: underlined only on hover, so colour is the only cue at rest
<Anchor component={NextLink} href={settingsPath}>
  設定
</Anchor>
```

In a table, the cell that opens the record is underlined, not merely coloured. A whole row that responds to a click still needs one cue inside it that says so.

## The Element Follows the Meaning, the Appearance Follows the Role

Navigation renders as `a`, state change renders as `button`. Mantine's `component` prop keeps the element correct while the appearance is chosen freely — `<Button component={NextLink} href={…}>` is a link that looks like a button — so there is never a reason to swap one for the other to get a look.

An icon-only control has no text node, so it needs an `aria-label`. Without one it is announced as "button" and nothing else.

```typescript
// Good
<ActionIcon aria-label="共有" size="lg" variant="light">
  <IconShare size={18} />
</ActionIcon>

// Bad: no accessible name
<ActionIcon size="lg" variant="light">
  <IconShare size={18} />
</ActionIcon>
```

## A Badge Means State, and Nothing Else

A record's current state is always visible on the row and on the single-object screen, as a `StatusBadge` carrying a label (`design-icon.md` decides its glyph). `design-a11y.md` requires the second, non-colour cue; this rule adds which elements are allowed to be badges at all.

A record's kind or category is an attribute, not a state — render it as plain text. When both are badges, the badge stops meaning anything and the row has no state indicator left.

```typescript
// Good: state as a badge, kind as text
<Table.Td>通常配送</Table.Td>
<Table.Td>
  <StatusBadge size="md" tone="awaiting">未発送</StatusBadge>
</Table.Td>

// Bad: the kind competes with the state
<Table.Td>
  <StatusBadge size="md" tone="queued">通常配送</StatusBadge>
</Table.Td>
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
