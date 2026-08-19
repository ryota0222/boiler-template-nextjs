---
description: Rules for accessible behaviour that neither Radix Themes nor the axe gate provides
paths: ['src/app/**/*.tsx', 'src/features/**/*.tsx', 'src/shared-components/**/*.tsx']
---

# Accessibility Rules

Radix Themes supplies most of the accessible behaviour this template needs, and the axe gate inspects roles, names, and contrast on every story. What follows is the remainder — the properties that neither of them holds, and that therefore fail silently.

`design-affordance.md` owns whether an element reads as operable, and the `aria-label` on icon-only controls. `design-hierarchy.md` owns which operable element wins. `design-states.md` owns which states must exist at all. This file owns how the interface behaves for someone who is not looking at it, or not using a mouse.

## Every Pointer Interaction Has a Keyboard Path

- **Type**: MUST
- **Reason**: Radix Themes components already carry the ARIA APG keyboard behaviour, so the only way to lose it is to attach the handler to something that was never a control. A `Box` with `onClick` cannot be reached by Tab, ignores Enter and Space, and is invisible to `getByRole`.

### Details

Anything that responds to a click is a `Button`, an `IconButton`, or a `Link`. Layout primitives — `Box`, `Flex`, `Grid`, `Section` — never take `onClick`. When a whole container must be operable, keep the primitive and hand the element over with `asChild` rather than attaching a handler to the wrapper.

```typescript
// Good
<Card asChild>
  <NextLink href={orderPath}>{order.title}</NextLink>
</Card>

// Bad: unreachable without a mouse
<Box onClick={handleSelect}>{order.title}</Box>
```

Overlays are `Dialog` or `AlertDialog`, never a hand-built one. Those components trap focus, restore it to the trigger on close, and close on Escape through `@radix-ui/react-focus-scope`. A hand-built overlay has to reimplement all three, and usually reimplements none.

Radix does not decide the order the controls come in, so these remain the author's:

- Tab order follows the visual order. Do not set `tabIndex` above 0 to repair an order — fix the DOM order instead.
- `Enter` in a search field runs the search. `Enter` in a form field does not submit when submitting is guarded by a confirmation dialog (`design-feedback.md`).
- A focus outline is always visible on `:focus-visible`. Never remove it without replacing it with something at least as visible.
- Focus never lands on a hidden element, which is one more reason inapplicable sections are hidden rather than disabled (`design-form.md`).

Walk the screen with the keyboard alone before calling it done. No gate performs this walk.

## Touch Targets Follow the Radix Size Scale

- **Type**: MUST
- **Reason**: `Button` and `IconButton` map `size` onto fixed heights, so target size is decided by a prop rather than by measurement. The default is smaller than a comfortable touch target, and an icon-only control has no text to widen it.

### Details

| `size` | Height | Use                                               |
| ------ | ------ | ------------------------------------------------- |
| `1`    | 24px   | WCAG 2.5.8 AA floor exactly — no margin for error |
| `2`    | 32px   | Default                                           |
| `3`    | 40px   | Icon-only controls in a pointer interface         |
| `4`    | 48px   | Icon-only controls reachable by touch             |

An icon-only control below `size="3"` needs a reason. `size="1"` is for dense, pointer-only surfaces where the controls are already separated by spacing.

## Text Meets WCAG AA, and the Step Is Chosen for That

- **Type**: MUST
- **Reason**: axe measures the pairs a story actually renders. It cannot tell you that the step you reached for is the wrong step, and the accent is a runtime decision (`themeConfig.accentColor`) so the ratio changes with the theme rather than with the code.

### Details

4.5:1 for every text pair, including `size="1"` notes and bold `Badge` labels. Radix Colors assigns each step a role, and only two of them are for text:

| Step | Role                                                         |
| ---- | ------------------------------------------------------------ |
| 3    | Tinted surface                                               |
| 6    | Border on a tinted surface                                   |
| 9    | Solid fill — no text sits on it unless the pair was measured |
| 11   | Text on white                                                |
| 12   | Text on a step-3 surface                                     |

Steps below 11 are for borders, disabled states, and decoration — never for text on white. Two pairs are worth measuring whenever the accent changes, because both look correct and neither is guaranteed: white on step 9, and step-11 text on a step-3 surface.

Disabled controls are exempt from the ratio, which is exactly why a screen must have at least one state where the submit button is enabled before anyone claims the palette passes — see the disabled-only story trap in `design-states.md`.

## State Is Never Carried by Colour Alone

- **Type**: MUST
- **Reason**: `design-affordance.md` requires a non-colour cue for whether an element is operable. The same failure applies one layer up, to which state it is in: `color="red"` on its own says nothing to a reader with colour blindness, and axe measures contrast rather than redundancy.

### Details

Selected, error, warning, and success states each carry a second cue — an icon, a text label, or a border. Radix `Badge` and `Callout` take an icon child; use it.

```typescript
// Good
<Callout.Root color="red">
  <Callout.Icon>
    <CircleAlert size={16} />
  </Callout.Icon>
  <Callout.Text>メールアドレスの形式が正しくありません</Callout.Text>
</Callout.Root>

// Bad: red is the only thing distinguishing this from a notice
<Callout.Root color="red">
  <Callout.Text>メールアドレスの形式が正しくありません</Callout.Text>
</Callout.Root>
```

## Every Control Has an Accessible Name

- **Type**: MUST
- **Reason**: axe reports a control with no name, but it cannot report a control whose name is technically present and useless. A column of twelve buttons all announced as `編集` passes the gate and is unusable.

### Details

- Every input is associated with a `label` element through `htmlFor` / `id`. A placeholder is not a label.
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

The interactions these describe are `design-collection.md`. Content that appears without focus moving is the next rule.

## Hand-Written Motion Is Opt-In

- **Type**: MUST
- **Reason**: Radix Themes already wraps its own animations in `@media (prefers-reduced-motion: no-preference)`, so components honour the preference for free. Motion written by hand does not inherit that, and vestibular disorders make unrequested movement a symptom trigger rather than a taste question.

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
- **Reason**: Radix Themes ships no toast or notification component, so every surface that reports a result is hand-built. A screen reader announces nothing when content appears somewhere the user is not focused, which is exactly what happens when a TanStack Query result, a save confirmation, or a result count arrives.

### Details

| What appeared                             | Markup                           |
| ----------------------------------------- | -------------------------------- |
| Validation tied to a field                | `aria-describedby` on the input  |
| Result count, save confirmation, progress | A container with `role="status"` |
| Urgent error not tied to any control      | A container with `role="alert"`  |

The container is rendered empty first and its text updated afterwards. A region inserted into the DOM already carrying its message is announced inconsistently.

```typescript
// Good: the region exists before it has anything to say
<Text role="status">{isSaved ? '保存しました' : ''}</Text>

// Bad: inserted and populated in the same render
{isSaved && <Text role="status">保存しました</Text>}
```

What these messages say is governed by `design-copy.md`; this rule covers only whether they are announced.

## Text Survives 200% Zoom and a 320px Viewport

- **Type**: MUST
- **Reason**: WCAG 2.1 requires content to reflow at 320px without horizontal scrolling, and a fixed height is the usual cause of failure — the box stops growing while the text inside it keeps wrapping.

### Details

Text containers take `minHeight`, never `height`. Rows of controls wrap rather than shrink. `verify-visual-design` captures 320px for exactly this check, so a layout that only holds together at 375px is caught before review rather than after.
