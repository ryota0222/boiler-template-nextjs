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
