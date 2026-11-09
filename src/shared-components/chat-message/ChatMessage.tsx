import type { ReactNode } from 'react';

import { Box, Group, VisuallyHidden } from '@mantine/core';
import { IconSparkles } from '@tabler/icons-react';

import { ThinkingOrbIcon } from '@/shared-components/thinking-orb-icon/ThinkingOrbIcon';

// オーブの大きさに合わせて印の枠の幅を取り、書いている間と書き終えた後で本文の位置が動かないようにする
const markWidth = 32;
const sparklesSize = 18;

// 話し手ごとの見せ方を 1 か所で決め、どの対話でも同じに分ける（design-surface.md）。
// 利用者の発言は右の吹き出し、AI の返答は面を持たない本文にし、先頭の印で始まりを示す
export const ChatMessage = ({
  children,
  isWriting,
  speaker,
  speakerLabel,
}: {
  readonly children: ReactNode;
  readonly isWriting: boolean;
  readonly speaker: 'assistant' | 'user';
  readonly speakerLabel: string;
}): React.JSX.Element => {
  if (speaker === 'user') {
    return (
      <Box
        bg="var(--mantine-primary-color-light)"
        maw="80%"
        ml="auto"
        px="md"
        py="sm"
        style={{
          borderRadius:
            'var(--mantine-radius-lg) var(--mantine-radius-xs) var(--mantine-radius-lg) var(--mantine-radius-lg)',
        }}
      >
        <VisuallyHidden>{speakerLabel}</VisuallyHidden>
        {children}
      </Box>
    );
  }

  return (
    // 書いている間は 1 行の進行中の文言なので、オーブ（32px）と文言を高さの中央でそろえる。
    // 書き終えた返答は何行にもなるため、印を 1 行目の頭にそろえる
    <Group align={isWriting ? 'center' : 'flex-start'} gap="xs" wrap="nowrap">
      <Box style={{ display: 'flex', flexShrink: 0, justifyContent: 'center' }} w={markWidth}>
        {/* 返答を書いている間は、✦ の代わりにオーブを置く（design-feedback.md） */}
        {isWriting ? (
          <ThinkingOrbIcon size="inline" />
        ) : (
          <IconSparkles
            aria-hidden
            color="var(--mantine-primary-color-filled)"
            size={sparklesSize}
          />
        )}
      </Box>
      <Box style={{ flex: 1, minWidth: 0 }}>
        <VisuallyHidden>{speakerLabel}</VisuallyHidden>
        {children}
      </Box>
    </Group>
  );
};
