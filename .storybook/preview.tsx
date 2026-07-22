import '@radix-ui/themes/styles.css';
import '@/app/globals.css';

import type { Preview } from '@storybook/nextjs-vite';

import { Theme } from '@radix-ui/themes';

import { themeAccentColor } from '@/helpers/theme';

const preview: Preview = {
  decorators: [
    (Story) => (
      <Theme accentColor={themeAccentColor}>
        <Story />
      </Theme>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // PostToolUse フックの vitest 実行で a11y 違反をブロッカーとして返すため 'error' を指定
      test: 'error',
    },
  },
};

export default preview;
