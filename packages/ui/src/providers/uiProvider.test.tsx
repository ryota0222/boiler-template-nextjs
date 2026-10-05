import { ScrollArea, useMantineTheme } from '@mantine/core';
import { UiProvider } from '@template/ui/providers/UiProvider';
import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

const themeConfig = {
  accentColors: [
    '#f0eefb',
    '#dcd8f5',
    '#b7aeec',
    '#9083e3',
    '#6e5ddb',
    '#5b47d6',
    '#4938d1',
    '#3b2bb8',
    '#3325a5',
    '#281d8f',
  ],
  accentShade: 6,
  appearance: 'light',
  fontFamily: 'sans-serif',
  fontFamilyMonospace: 'monospace',
  isConfigured: true,
  radius: 'md',
  voiceAndTone: 'standard',
} as const;

const PrimaryColorProbe = (): React.JSX.Element => <p>{useMantineTheme().primaryColor}</p>;

it('childrenを渡した場合、childrenを描画すること', () => {
  render(
    <UiProvider themeConfig={themeConfig}>
      <p>子要素</p>
    </UiProvider>
  );

  const actual = screen.getByText('子要素');

  expect(actual).toBeInTheDocument();
});

it('テーマの設定を渡した場合、子孫の部品から主色をアクセント色として参照できること', () => {
  render(
    <UiProvider themeConfig={themeConfig}>
      <PrimaryColorProbe />
    </UiProvider>
  );

  const actual = screen.getByText('accent');

  expect(actual).toBeInTheDocument();
});

it('ResizeObserver を使う部品を渡した場合、その部品を描画すること', () => {
  render(
    <UiProvider themeConfig={themeConfig}>
      <ScrollArea h={100}>
        <p>スクロールする内容</p>
      </ScrollArea>
    </UiProvider>
  );

  const actual = screen.getByText('スクロールする内容');

  expect(actual).toBeInTheDocument();
});

it('ライトの配色の場合、控えめな文字の色を Mantine の既定の gray.6 より十分に濃い gray.7 にすること', () => {
  render(
    <UiProvider themeConfig={themeConfig}>
      <p>子要素</p>
    </UiProvider>
  );

  const actual = [...document.querySelectorAll('style')].map((style) => style.textContent).join('');

  expect(actual).toContain('--mantine-color-dimmed: var(--mantine-color-gray-7)');
});

it('ライトの配色の場合、入力欄のプレースホルダーの色を白の背景で 3:1 に届かない gray.5 ではなく gray.7 にすること', () => {
  render(
    <UiProvider themeConfig={themeConfig}>
      <p>子要素</p>
    </UiProvider>
  );

  const actual = [...document.querySelectorAll('style')].map((style) => style.textContent).join('');

  expect(actual).toContain('--mantine-color-placeholder: var(--mantine-color-gray-7)');
});

it('ライトの配色の場合、入力エラーの色を Mantine の既定の red.6 より十分に濃い red.9 にすること', () => {
  render(
    <UiProvider themeConfig={themeConfig}>
      <p>子要素</p>
    </UiProvider>
  );

  const actual = [...document.querySelectorAll('style')].map((style) => style.textContent).join('');

  expect(actual).toContain('--mantine-color-error: var(--mantine-color-red-9)');
});
