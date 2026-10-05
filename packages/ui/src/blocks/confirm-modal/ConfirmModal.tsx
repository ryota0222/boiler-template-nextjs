'use client';

import type { ReactNode } from 'react';

import { Button, Group, Modal, Stack, Text } from '@mantine/core';
import { accentColorName } from '@template/ui/theme/createAppTheme';

// 既定の red（shade 6）は白い文字とのコントラスト比が 3.28:1 で axe の検査の 3:1 をわずかに超えるだけのため、
// 入力エラーの色と同じ shade 9（5.46:1）で塗る
const destructiveColor = 'red.9';

export const ConfirmModal = ({
  closeLabel,
  confirmLabel,
  description,
  isConfirming,
  isDestructive,
  isOpened,
  onClose,
  onConfirm,
  summary,
  title,
}: {
  readonly closeLabel: string;
  readonly confirmLabel: string;
  readonly description: ReactNode;
  readonly isConfirming: boolean;
  readonly isDestructive: boolean;
  readonly isOpened: boolean;
  readonly onClose: () => void;
  readonly onConfirm: () => void;
  readonly summary: readonly {
    readonly label: string;
    readonly value: string;
  }[];
  readonly title: string;
}): React.JSX.Element => (
  // ヘッダーの × を外すと、フォーカストラップが最初にフォーカスするのが左端の閉じるボタンになる
  <Modal centered onClose={onClose} opened={isOpened} title={title} withCloseButton={false}>
    <Stack gap="lg">
      {/* description にはブロック要素も渡せるよう、p ではなく div で包む */}
      <Text component="div" size="sm">
        {description}
      </Text>
      <Stack component="dl" gap="xs" m={0}>
        {summary.map((summaryItem) => (
          <Group justify="space-between" key={summaryItem.label}>
            <Text c="dimmed" component="dt" size="sm">
              {summaryItem.label}
            </Text>
            <Text component="dd" m={0} size="sm">
              {summaryItem.value}
            </Text>
          </Group>
        ))}
      </Stack>
      <Group justify="space-between">
        <Button onClick={onClose} size="md" variant="outline">
          {closeLabel}
        </Button>
        <Button
          color={isDestructive ? destructiveColor : accentColorName}
          loading={isConfirming}
          onClick={onConfirm}
          size="md"
        >
          {confirmLabel}
        </Button>
      </Group>
    </Stack>
  </Modal>
);
