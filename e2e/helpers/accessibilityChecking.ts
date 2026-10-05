import type { Page } from '@playwright/test';

import AxeBuilder from '@axe-core/playwright';

// 文字の色の対比の基準を 3:1 にしているため（主色の段階の選び方と Storybook の a11y の検査も同じ）、
// axe の color-contrast の既定（本文 4.5:1）を上書きする
const minimumContrastRatio = 3;

// axe-core の RunOptions の型にも文書にもない挙動で、axe.run は checks に渡した options を
// その検査の既定の options に重ねて使う（axe-core 4.13 のソースの getCheckOption と Check#getOptions で確かめた）。
// 効かなくなった場合は axe の既定の 4.5:1 で測られ、検査が厳しくなる側に壊れる
const axeRunOptions: Parameters<AxeBuilder['options']>[0] & {
  readonly checks: Record<string, { readonly options: unknown }>;
} = {
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
};

// moderate・minor の違反は失敗にせず、利用を妨げる serious・critical の違反だけを返す
export const findSeriousAccessibilityViolations = async (
  page: Page
): Promise<Awaited<ReturnType<AxeBuilder['analyze']>>['violations']> => {
  const { violations } = await new AxeBuilder({ page }).options(axeRunOptions).analyze();

  return violations.filter(({ impact }) => impact === 'critical' || impact === 'serious');
};
