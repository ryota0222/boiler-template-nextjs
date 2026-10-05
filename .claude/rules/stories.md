---
description: Rules for Storybook story files
paths: ['src/**/*.stories.tsx', 'packages/*/src/**/*.stories.tsx']
---

# Stories Rules

## Purpose

Stories in this repository exist for one reason: every story is checked by axe through the Storybook a11y gate (`@storybook/addon-a11y` run by `@storybook/addon-vitest`). The goal is to have axe inspect every render whose result could differ — nothing more, nothing less. A render that axe would judge identically to another story adds run time and no protection; a render that could fail differently and has no story is never checked.

Page-level properties — heading order across the page and landmarks — cannot be seen here. axe sees them only on a whole page, which is why every page an e2e test visits gets an axe check (`e2e-test-standards.md`). axe reports heading order and landmarks as `moderate`, which neither gate fails on (`design-a11y.md`), so the e2e check catches only the page-level `serious` and `critical` violations, such as a missing page title or `lang`.

## Story Coverage

Every component in `src/shared-components/`, `src/features/`, and `packages/ui/src/blocks/` must have a co-located `.stories.tsx` file.

## Story Granularity

| Rule   | Condition                                                                                                                                                               |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Create | At least one story for every component                                                                                                                                  |
| Create | Each value of a prop that changes a colour or variant — the contrast changes                                                                                            |
| Create | Each prop value or state that changes the DOM — `disabled`, an icon-only button, an element that appears, disappears, or is swapped for another                         |
| Create | The UI Stack states Ideal, Empty, Loading, Error, and Not Found (`design-states.md`)                                                                                    |
| Create | An input validation error                                                                                                                                               |
| Create | Every overlay opened — modal, menu, popover, drawer, expanded accordion — rendered through `args` or a `play` function                                                  |
| Create | A submit button that is enabled                                                                                                                                         |
| Skip   | A prop value that changes only size, spacing, or radius                                                                                                                 |
| Skip   | Partial, unless its DOM differs from Ideal                                                                                                                              |
| Skip   | Content conditions — long text, many items, minimal content, mixed scripts. axe cannot detect overflow or broken wrapping, so these stories would pass whatever happens |

For combined states (e.g., variant + color), add a story only when the combination renders something neither story renders alone — the `light` variant in red is a colour pair that neither `variant: "light"` nor `color: "red"` renders by itself. A combination with `disabled` adds nothing: axe does not measure the contrast of disabled controls.

An overlay that is closed in the initial render is not in the DOM, so axe never sees it. Open it with `args` when the component takes an open flag (`isOpened: true`), otherwise with a `play` function that clicks the trigger. axe runs after `play` finishes, so `play` must also wait until the opening transition has finished: mid-fade, the overlay is partly transparent and axe measures the wrong contrast. `toBeVisible` is not enough, because it passes as soon as the opacity is above 0.

```typescript
export const Opened: Story = {
  name: '開いた場合',
  play: async ({ canvasElement }): Promise<void> => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: '表示する列' }));

    const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog');
    await waitFor(async () => {
      await expect(getComputedStyle(dialog).opacity).toBe('1');
    });
  },
};
```

A story may also carry a `play` function that verifies behaviour only a real browser can show — focus returning after Escape, virtual scrolling, reading a `File`. Such a story is kept even when its final render adds nothing new for axe; say what it verifies in a comment above it.

The content conditions remain design rules in `design-states.md`: build the component so that they do not break it. Only the obligation to write a story for them is removed.

## Naming

- Export names use English PascalCase (e.g., `VariantFilled`, `ColorRed`, `Disabled`)
- Set the `name` property to Japanese in the format `「{prop名}が{value}の場合」`
- For combined states: `「{prop名}が{value}かつ{prop名}が{value}の場合」`
- UI states, an input validation error, and an opened overlay have no corresponding prop value. Name them with the fixed names in `design-states.md`

```typescript
export const VariantFilled: Story = {
  args: {
    children: 'ボタン',
    variant: 'filled',
  },
  name: 'variantがfilledの場合',
};

export const VariantLightColorRed: Story = {
  args: {
    children: 'プロジェクトを削除',
    color: 'red',
    variant: 'light',
  },
  name: 'variantがlightかつcolorがredの場合',
};
```
