---
description: Rules for Storybook story files
paths: ['src/**/*.stories.tsx']
---

# Stories Rules

## Story Coverage

Every component in `src/shared-components/` and `src/features/` must have a co-located `.stories.tsx` file.

## Story Granularity

Create one story per prop value that causes a visual difference. For combined states (e.g., disabled + variant), add stories for meaningful combinations.

## Naming

- Export names use English PascalCase (e.g., `VariantDefault`, `SizeLarge`, `Disabled`)
- Set the `name` property to Japanese in the format `「{prop名}が{value}の場合」`
- For combined states: `「{prop名}が{value}かつ{prop名}が{value}の場合」`

```typescript
export const VariantDefault: Story = {
  args: {
    children: 'ボタン',
    variant: 'default',
  },
  name: 'variantがdefaultの場合',
};

export const DisabledDestructive: Story = {
  args: {
    children: '削除',
    disabled: true,
    variant: 'destructive',
  },
  name: 'disabledがtrueかつvariantがdestructiveの場合',
};
```
