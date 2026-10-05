import { createAppTheme } from '@template/ui/theme/createAppTheme';
import { expect, it } from 'vitest';

const accentColors = [
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
] as const;

const themeConfig = {
  accentColors,
  accentShade: 6,
  appearance: 'light',
  fontFamily: 'sans-serif',
  fontFamilyMonospace: 'monospace',
  isConfigured: true,
  radius: 'md',
  voiceAndTone: 'standard',
} as const;

it('テーマの設定を渡した場合、主色の名前をアクセント色にすること', () => {
  const actual = createAppTheme(themeConfig).primaryColor;

  expect(actual).toBe('accent');
});

it('テーマの設定を渡した場合、アクセント色の 10 段階を色の定義に入れること', () => {
  const actual = createAppTheme(themeConfig).colors?.accent;

  expect(actual).toStrictEqual(accentColors);
});

it('テーマの設定を渡した場合、主色の濃さをアクセント色の段階にすること', () => {
  const actual = createAppTheme(themeConfig).primaryShade;

  expect(actual).toBe(6);
});

it('テーマの設定を渡した場合、角の丸みの既定値を設定の値にすること', () => {
  const actual = createAppTheme(themeConfig).defaultRadius;

  expect(actual).toBe('md');
});

it('テーマの設定を渡した場合、本文のフォントを設定の値にすること', () => {
  const actual = createAppTheme(themeConfig).fontFamily;

  expect(actual).toBe('sans-serif');
});

it('テーマの設定を渡した場合、等幅のフォントを設定の値にすること', () => {
  const actual = createAppTheme(themeConfig).fontFamilyMonospace;

  expect(actual).toBe('monospace');
});

it('テーマの設定を渡した場合、OS の視差効果を減らす設定に従ってアニメーションを止めること', () => {
  const actual = createAppTheme(themeConfig).respectReducedMotion;

  expect(actual).toBe(true);
});

it('テーマの設定を渡した場合、外側の面の影を中の面へ引き継がないよう Card と Paper の影の既定値を影なしにすること', () => {
  const actual = createAppTheme(themeConfig).components;

  expect(actual).toStrictEqual({
    Card: { defaultProps: { shadow: 'none' } },
    Paper: { defaultProps: { shadow: 'none' } },
  });
});
