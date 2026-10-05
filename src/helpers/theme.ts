import type { ThemeConfig } from '@template/ui/theme/themeConfig';

export const themeConfig = {
  accentColors: [
    '#f0edff',
    '#dcd8fa',
    '#b5aeee',
    '#8c81e2',
    '#6a5cd8',
    '#5444d3',
    '#4938d1',
    '#3a2ab9',
    '#3225a7',
    '#281f94',
  ],
  accentShade: 6,
  appearance: 'light',
  // Geist は日本語の字形を持たないため、日本語はゴシック体の代わりのフォントで描く。
  // Geist を読み込めない環境（Storybook など）でも明朝体にならないよう、var の既定値も置く
  fontFamily:
    'var(--font-geist-sans, system-ui), "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", Meiryo, sans-serif',
  fontFamilyMonospace:
    'var(--font-geist-mono, ui-monospace), "Hiragino Sans", "Noto Sans JP", Meiryo, monospace',
  isConfigured: false,
  radius: 'md',
  voiceAndTone: 'standard',
} as const satisfies ThemeConfig;
