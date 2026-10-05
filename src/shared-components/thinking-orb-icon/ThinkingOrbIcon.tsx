'use client';

import { ThinkingOrb } from 'thinking-orbs';

// LLM が考えている・作っている間だけに出し、通信やサーバーを待つ間の Loader と見分けさせる（design-feedback.md）。
// 自動の配色判定は Mantine が付けない data-theme か OS の設定を見るため、OS がダークモードでも暗い点で描くよう明るい背景用に固定する。
// 横に必ず進行中の文言を置くため、英語の既定の読み上げ名は使わず読み上げから外す
// 文言の横に置く大きさと、作成中の枠の中央に置く大きさだけを使う（どちらも thinking-orbs が専用に調整した大きさ）
const orbSizes = { inline: 20, large: 64 } as const;

export const ThinkingOrbIcon = ({
  size,
}: {
  readonly size: keyof typeof orbSizes;
}): React.JSX.Element => (
  <ThinkingOrb aria-hidden size={orbSizes[size]} state="working" theme="light" />
);
