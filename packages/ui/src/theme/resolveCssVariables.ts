import type { CSSVariablesResolver } from '@mantine/core';

// Mantine の既定では、ライトの配色の入力欄のプレースホルダーが gray.5 で、白の背景とのコントラスト比が 2.07:1 しかなく
// axe の検査の 3:1 に届かない。控えめな文字（c="dimmed"、gray.6、3.32:1）と、入力エラーの文字と入力欄の文字（red.6、3.28:1）は
// 3:1 をわずかに超えるだけで、利用者が読む必要のある文字のため、どれも十分に高い gray.7（8.18:1）と red.9（5.46:1）に置き換える
export const resolveCssVariables: CSSVariablesResolver = () => ({
  dark: {},
  light: {
    '--mantine-color-dimmed': 'var(--mantine-color-gray-7)',
    '--mantine-color-error': 'var(--mantine-color-red-9)',
    '--mantine-color-placeholder': 'var(--mantine-color-gray-7)',
  },
  variables: {},
});
