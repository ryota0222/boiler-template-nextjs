---
description: Rules for accessible behaviour that neither Mantine nor the axe gate provides
paths:
  [
    'src/app/**/*.tsx',
    'src/features/**/*.tsx',
    'src/shared-components/**/*.tsx',
    'packages/ui/src/blocks/**/*.tsx',
  ]
---

# Accessibility Rules

Mantine supplies most of the accessible behaviour this repository needs, and the axe gate inspects roles, names, and contrast on every story. What follows is the remainder — the properties that neither of them holds, and that therefore fail silently.

The gate — the Storybook a11y check and the axe check in every e2e test alike — fails only on `serious` and `critical` violations, and measures `color-contrast` at 3:1 instead of axe's default of 4.5:1 for body text. A `moderate` or `minor` violation (heading order, landmarks, an empty heading) shows in the Storybook a11y panel and in axe's full results but fails neither gate, so nothing forces it to be fixed: fix one when you see it, and never read a passing gate as proof that there is none.

`design-affordance.md` owns whether an element reads as operable, and the `aria-label` on icon-only controls. `design-hierarchy.md` owns which operable element wins. `design-states.md` owns which states must exist at all. This file owns how the interface behaves for someone who is not looking at it, or not using a mouse.

## Every Pointer Interaction Has a Keyboard Path

- **Type**: MUST
- **Reason**: Mantine's controls already carry the ARIA APG keyboard behaviour, so the only way to lose it is to attach the handler to something that was never a control. A `Box` with `onClick` cannot be reached by Tab, ignores Enter and Space, and is invisible to `getByRole`.

### Details

Anything that responds to a click is a `Button`, an `ActionIcon`, an `Anchor`, or an `UnstyledButton`. Layout primitives — `Box`, `Group`, `Stack`, `Flex`, `Grid`, `SimpleGrid` — never take `onClick`. When a whole container must be operable, render the container as the control through its `component` prop rather than attaching a handler to the wrapper.

```typescript
// Good
<Card component={NextLink} href={orderPath}>
  {order.title}
</Card>

// Bad: unreachable without a mouse
<Box onClick={handleSelect}>{order.title}</Box>
```

Overlays are `Modal` or `Drawer`, never a hand-built one. In Mantine 9.6.2 both trap focus, return it to the trigger on close, and close on Escape by default (`trapFocus`, `returnFocus`, `closeOnEscape`). Never turn those props off. A hand-built overlay has to reimplement all three, and usually reimplements none.

Mantine's `Menu` defaults to `withInitialFocusPlaceholder={true}`, which places a `role="presentation"` div directly under `role="menu"` and fails axe's `aria-required-children` rule; pass `withInitialFocusPlaceholder={false}` on every `Menu` in this repository, as `AppShellLayout` does.

Mantine does not decide the order the controls come in, so these remain the author's:

- Tab order follows the visual order. Do not set `tabIndex` above 0 to repair an order — fix the DOM order instead.
- `Enter` in a search field runs the search. `Enter` in a form field does not submit when submitting is guarded by a confirmation dialog (`design-feedback.md`).
- A focus outline is always visible on `:focus-visible`. Never remove it without replacing it with something at least as visible.
- Focus never lands on a hidden element, which is one more reason inapplicable sections are hidden rather than disabled (`design-form.md`).

Walk the screen with the keyboard alone before calling it done. No gate performs this walk.

## Touch Targets Follow the Mantine Size Scale

- **Type**: MUST
- **Reason**: `Button` and `ActionIcon` map `size` onto fixed heights, so target size is decided by a prop rather than by measurement. Some sizes fall below the WCAG 2.5.8 AA floor of 24px, and an icon-only control has no text to widen it.

### Details

| Control      | `size`       | Height  | Use                                       |
| ------------ | ------------ | ------- | ----------------------------------------- |
| `Button`     | `compact-xs` | 22px    | Never — below the 24px floor              |
| `Button`     | `compact-sm` | 26px    | Dense, pointer-only surfaces              |
| `Button`     | `sm`         | 36px    | Default                                   |
| `ActionIcon` | `xs`, `sm`   | 18–22px | Never — below the 24px floor              |
| `ActionIcon` | `md`         | 28px    | Default; dense, pointer-only surfaces     |
| `ActionIcon` | `lg`         | 34px    | Icon-only controls in a pointer interface |
| `ActionIcon` | `xl`         | 44px    | Icon-only controls reachable by touch     |
| `Checkbox`   | `xs`, `sm`   | 16–20px | Never — below the 24px floor              |
| `Checkbox`   | `md`         | 24px    | Default for row selection                 |

An icon-only control below `size="lg"` needs a reason. `size="md"` is for dense, pointer-only surfaces where the controls are already separated by spacing.

## Text Clears 3:1, and the Shade Is Chosen for That

- **Type**: MUST
- **Reason**: axe measures the pairs a story actually renders. It cannot tell you that the shade you reached for is the wrong shade, and the accent is a per-app decision (`themeConfig.accentColors`) so the ratio changes with the theme rather than with the code.

### Details

3:1 for every text pair, including `size="xs"` notes and bold `Badge` labels. This is the ratio both axe gates measure `color-contrast` against (lowered by decision from axe's default, which is WCAG AA's 4.5:1 for body text), and the ratio `generateAccentColors` holds the accent's primary shade to against white, so every accent the app can have carries white text and sits on white as text. Mantine's shade number says nothing about whether a shade may carry text, so the pairs below were measured against Mantine 9.6.2's default colours:

| Pair                                                      | Passes (≥ 3:1)                                                         | Fails                                                      |
| --------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------- |
| Coloured text on white                                    | `gray.6`–`9`, `red.6`–`9`, `blue.6`–`9`, `orange.7`–`9`, `green.8`–`9` | `yellow` in every shade (shade 9 sits on the line, 3.00:1) |
| White text on a `filled` fill (the primary shade)         | `accent` (any of the four presets), `red` (3.28:1), `blue` (3.56:1)    | `green` (2.36:1), `orange` (2.57:1), `yellow` (1.86:1)     |
| Shade-9 text on a shade-1 surface (the `light` variant)   | `red` (4.51:1), `green` (3.81:1), `orange` (3.62:1)                    | `yellow` (2.69:1)                                          |
| `gray.9` (the default text colour) on any shade-1 surface | Every colour                                                           | —                                                          |

What follows from the table:

- Body and note text stays in the default text colour or `c="dimmed"`. `UiProvider` redefines `dimmed` as `gray.7` (8.18:1) instead of Mantine's default, `gray.6` (3.32:1), the input placeholder colour as `gray.7` instead of `gray.5` (2.07:1, below the floor), and the error colour — the validation message and the text of an invalid input — as `red.9` (5.46:1) instead of `red.6` (3.28:1). `gray.6` and `red.6` clear the floor; the redefinitions keep secondary text and the messages a user must read well above it.
- Success and warning never colour text. They colour a surface, a border, a dot, or an icon, and the words stay in the default text colour. Non-text marks need 3:1 (WCAG 1.4.11); shade 9 on white clears it for `green` (4.37:1) and `orange` (4.30:1).
- `filled` controls carrying text are the accent only, with one exception: a destructive confirmation is `color="red.9"` (white on shade 9 measures 5.46:1), the same shade as the error colour, never `color="red"`, which fills with shade 6 (3.28:1).
- A badge showing state is `StatusBadge` (`design-icon.md`): the label stays in the default text colour and a filled glyph carries the colour.
- An `Alert` is `variant="light"` only for `red` and the accent. Any other colour or variant is used only after its story passes the axe gate.

Two pairs are worth measuring whenever an app's accent changes, because both look correct and neither is guaranteed: white on the accent's primary shade, and accent shade 9 on accent shade 1.

Disabled controls are exempt from the ratio, which is exactly why a screen must have at least one state where the submit button is enabled before anyone claims the palette passes — see the disabled-only story trap in `design-states.md`.

## State Is Never Carried by Colour Alone

- **Type**: MUST
- **Reason**: `design-affordance.md` requires a non-colour cue for whether an element is operable. The same failure applies one layer up, to which state it is in: `color="red"` on its own says nothing to a reader with colour blindness, and axe measures contrast rather than redundancy.

### Details

Selected, error, warning, and success states each carry a second cue — an icon, a text label, or a border. `Alert` takes an `icon` prop and `Badge` takes a `leftSection`; use them.

```typescript
// Good
<Alert color="red" icon={<IconAlertCircle size={16} />} variant="light">
  メールアドレスの形式が正しくありません
</Alert>

// Bad: red is the only thing distinguishing this from a notice
<Alert color="red" variant="light">
  メールアドレスの形式が正しくありません
</Alert>
```

## Every Control Has an Accessible Name

- **Type**: MUST
- **Reason**: axe reports a control with no name, but it cannot report a control whose name is technically present and useless. A column of twelve buttons all announced as `編集` passes the gate and is unusable.

### Details

- Every input gets its name from the `label` prop of the Mantine input (`TextInput`, `Select`, `NumberInput`, …), which ties the `label` element to the input for you. A placeholder is not a label.
- A control repeated per row names its row: `注文 #1024 を編集`, not `編集`. Use `aria-label` for the full name and keep the visible text short.
- Images and icons that carry no meaning are hidden with `aria-hidden`.

The `aria-label` on an icon-only control is `design-affordance.md`; this rule is about the names of everything else.

## State Is Announced, Not Only Drawn

- **Type**: MUST
- **Reason**: The section above covers state a sighted reader can see. These attributes are the only way the same state reaches a screen reader, and none of them has a visual side effect that would reveal its absence.

### Details

| What                           | Attribute                               |
| ------------------------------ | --------------------------------------- |
| Current page in the navigation | `aria-current="page"`                   |
| Sorted column                  | `aria-sort="ascending" \| "descending"` |
| Selected row                   | `aria-selected` on the row              |
| Radio group                    | A group with an accessible name         |

`Tabs` sets its own selected state. `NavLink` does not set `aria-current` in Mantine 9.6.2 — pass it yourself (`aria-current={isCurrent ? "page" : undefined}`), as `AppShellLayout` does. `Table` sets none of these, so a sortable or selectable table sets them itself — or use `DataTable` from `@template/ui`, which does. The interactions these describe are `design-collection.md`. Content that appears without focus moving is the next rule.

## Hand-Written Motion Is Opt-In

- **Type**: MUST
- **Reason**: `createAppTheme` turns on Mantine's `respectReducedMotion`, so Mantine's own transitions honour the preference. Motion written by hand does not inherit that, and vestibular disorders make unrequested movement a symptom trigger rather than a taste question.

### Details

Every `transition` and `animation` written in `globals.css` or a component sits inside the same query. Under reduced motion, replace movement with an opacity change rather than removing the feedback entirely.

```css
/* Good */
@media (prefers-reduced-motion: no-preference) {
  .panel {
    transition: translate 150ms ease-out;
  }
}

/* Bad: moves regardless of the preference */
.panel {
  transition: translate 150ms ease-out;
}
```

Motion is never the only signal. A state change that animates also changes something static — a label, an icon, or a colour.

## Content That Appears Without Focus Moving Announces Itself

- **Type**: MUST
- **Reason**: A screen reader announces nothing when content appears somewhere the user is not focused, which is exactly what happens when a server result, a save confirmation, or a result count arrives.

### Details

| What appeared                             | Markup                                                                     |
| ----------------------------------------- | -------------------------------------------------------------------------- |
| Validation tied to a field                | The input's `error` prop, which sets `aria-invalid` and `aria-describedby` |
| Result count, save confirmation, progress | A container with `role="status"`                                           |
| Urgent error not tied to any control      | A container with `role="alert"`                                            |

`@mantine/notifications` gives every notification `role="alert"` unless told otherwise, which interrupts the screen reader. A success toast passes `role: "status"` to `notifications.show`.

A hand-built region is rendered empty first and its text updated afterwards. A region inserted into the DOM already carrying its message is announced inconsistently.

```typescript
// Good: the region exists before it has anything to say
<Text role="status" size="sm">{isSaved ? '保存しました' : ''}</Text>

// Bad: inserted and populated in the same render
{isSaved && <Text role="status" size="sm">保存しました</Text>}
```

What these messages say is governed by `design-copy.md`; this rule covers only whether they are announced.

## Text Survives 200% Zoom and a 320px Viewport

- **Type**: MUST
- **Reason**: WCAG 2.1 requires content to reflow at 320px without horizontal scrolling, and a fixed height is the usual cause of failure — the box stops growing while the text inside it keeps wrapping.

### Details

Text containers take `mih`, never `h`. Rows of controls wrap rather than shrink — `Group` wraps by default, so do not pass `wrap="nowrap"` to a row of controls. `verify-visual-design` captures 320px for exactly this check, so a layout that only holds together at 375px is caught before review rather than after.
