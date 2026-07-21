import '@/app/globals.css';

import type { Preview } from '@storybook/nextjs-vite';

const preview: Preview = {
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
