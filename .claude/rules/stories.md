---
description: Rules for Storybook story files
paths: ['src/**/*.stories.tsx']
---

# Stories Rules

## Story Coverage

Every component in `src/shared-components/` and `src/features/` must have a co-located `.stories.tsx` file.

## Story Granularity

Create one story per prop value that causes a visual difference. For combined states (e.g., disabled + variant), add stories for meaningful combinations.

UI states and content conditions also require their own stories. See `design-states.md` for which ones are mandatory and how to name them — those stories are not derived from a prop value, so the naming convention below does not apply to them.

## Naming

- Export names use English PascalCase (e.g., `VariantSolid`, `SizeLarge`, `Disabled`)
- Set the `name` property to Japanese in the format `「{prop名}が{value}の場合」`
- For combined states: `「{prop名}が{value}かつ{prop名}が{value}の場合」`

```typescript
export const VariantSolid: Story = {
  args: {
    children: 'ボタン',
    variant: 'solid',
  },
  name: 'variantがsolidの場合',
};

export const DisabledColorRed: Story = {
  args: {
    children: 'プロジェクトを削除',
    color: 'red',
    disabled: true,
  },
  name: 'disabledがtrueかつcolorがredの場合',
};
```
