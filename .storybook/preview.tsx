import '@mantine/core/styles.css';

import '@/app/globals.css';

import type { Preview } from '@storybook/nextjs-vite';

import { UiProvider } from '@template/ui/providers/UiProvider';

import { themeConfig } from '@/helpers/theme';

// 文字の色の対比の基準を 3:1 にしているため（主色の段階の選び方と e2e の axe の検査も同じ）、
// axe の color-contrast の既定（本文 4.5:1）を上書きする
const minimumContrastRatio = 3;

const preview: Preview = {
  decorators: [
    (Story): React.JSX.Element => (
      <UiProvider themeConfig={themeConfig}>
        <Story />
      </UiProvider>
    ),
  ],
  parameters: {
    a11y: {
      options: {
        // axe-core の RunOptions の型にも文書にもない挙動で、axe.run は checks に渡した options を
        // その検査の既定の options に重ねて使う（axe-core 4.12 のソースの getCheckOption と Check#getOptions で確かめた）。
        // 効かなくなった場合は axe の既定の 4.5:1 で測られ、検査が厳しくなる側に壊れる
        checks: {
          'color-contrast': {
            options: {
              contrastRatio: {
                large: { expected: minimumContrastRatio },
                normal: { expected: minimumContrastRatio },
              },
            },
          },
        },
        // addon-a11y は axe に渡した options の impactLevels で、テストを落とす違反を絞る。
        // moderate・minor の違反は a11y のパネルに出るだけで、テストは落とさない。
        // 文書にない挙動で、addon-a11y 10.5 のソース（toHaveNoViolations が results.toolOptions.impactLevels で絞る）で確かめた。
        // 効かなくなった場合はすべての違反でテストが落ち、検査が厳しくなる側に壊れる
        impactLevels: ['critical', 'serious'],
      },
      // PostToolUse フックの vitest 実行で a11y 違反をブロッカーとして返すため 'error' を指定
      test: 'error',
    },

    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
