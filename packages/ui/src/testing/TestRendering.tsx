import type { RenderResult } from '@testing-library/react';
import type { AnchorHTMLAttributes, ReactNode } from 'react';

import { UiProvider } from '@template/ui/providers/UiProvider';
import { render } from '@testing-library/react';
import { createElement } from 'react';

const testThemeConfig = {
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
  fontFamily: 'sans-serif',
  fontFamilyMonospace: 'monospace',
  isConfigured: true,
  radius: 'md',
  voiceAndTone: 'standard',
} as const;

export const renderWithUi = (ui: ReactNode): RenderResult =>
  render(<UiProvider themeConfig={testThemeConfig}>{ui}</UiProvider>);

// Next.js の Link と同じく、受け取った属性（aria-current など）をすべて a 要素に渡す。
// JSX の spread は規約で禁止のため、createElement に props をそのまま渡す
export const TestLink = (properties: AnchorHTMLAttributes<HTMLAnchorElement>): React.JSX.Element =>
  createElement('a', properties);
