'use client';

import { parseThemeColor, useComputedColorScheme, useMantineTheme } from '@mantine/core';
import { ThinkingOrb } from 'thinking-orbs';

// LLM が考えている・作っている間だけに出し、通信やサーバーを待つ間の Loader と見分けさせる（design-feedback.md）。
// 横に必ず進行中の文言を置くため、英語の既定の読み上げ名は使わず読み上げから外す
// 文言の横に置く大きさと、作成中の枠の中央に置く大きさだけを使う。文言の横は、20px では動きが読み取りにくいため 32px にする
const orbSizes = { inline: 32, large: 64 } as const;

export const ThinkingOrbIcon = ({
  size,
}: {
  readonly size: keyof typeof orbSizes;
}): React.JSX.Element => {
  const theme = useMantineTheme();
  // 自動の配色判定は Mantine が付けない data-theme か OS の設定を見るため、Mantine が決めた配色を渡す
  const colorScheme = useComputedColorScheme('light');

  return (
    // オーブは canvas に描くため CSS 変数を読めない。色はアプリの主色の段階を Mantine から受け取って渡す。
    // 球の上を光の線が走る searching にし、AI が調べている様子を見せる
    <ThinkingOrb
      aria-hidden
      color={parseThemeColor({ color: theme.primaryColor, colorScheme, theme }).value}
      size={orbSizes[size]}
      state="searching"
      theme={colorScheme}
    />
  );
};
