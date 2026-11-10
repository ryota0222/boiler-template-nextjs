'use client';

import { ActionIcon, CopyButton, Group, Text } from '@mantine/core';
import { IconCheck, IconCopy } from '@tabler/icons-react';

const iconSize = 18;
const statusGap = 2;

// 注文番号や ID のように手で写すと間違えやすい値の横に、コピーのボタンを置く。
// コピーしたことはボタンの横でその場に返し、通知は出さない（design-feedback.md）
export const CopyableValue = ({
  copiedLabel,
  copyLabel,
  value,
}: {
  readonly copiedLabel: string;
  readonly copyLabel: string;
  readonly value: string;
}): React.JSX.Element => (
  <CopyButton value={value}>
    {({ copied, copy }) => (
      <Group gap="xs" wrap="nowrap">
        <Text ff="monospace" size="sm">
          {value}
        </Text>
        {/* チェックの印は 34px のボタンの中央にあるため、横の文字はボタンにほぼ付けて、印と文字を 1 つの答えとして読ませる */}
        <Group gap={statusGap} wrap="nowrap">
          <ActionIcon aria-label={copyLabel} color="gray" onClick={copy} size="lg" variant="subtle">
            {copied ? (
              <IconCheck aria-hidden color="var(--mantine-color-green-9)" size={iconSize} />
            ) : (
              <IconCopy aria-hidden size={iconSize} />
            )}
          </ActionIcon>
          <Text c="dimmed" component="span" role="status" size="xs">
            {copied ? copiedLabel : ''}
          </Text>
        </Group>
      </Group>
    )}
  </CopyButton>
);
