'use client';

import type { ReactNode } from 'react';

import { Box, Paper, Stack, Text, VisuallyHidden } from '@mantine/core';
import { IconAlertCircle, IconCircleCheck, IconWifiOff } from '@tabler/icons-react';
import { pendingDelayMs } from '@template/ui/blocks/delayed-pending/DelayedPending';
import classes from '@template/ui/blocks/result-card/ResultCard.module.css';
import { useEffect, useState } from 'react';

const statusIconSize = 20;

// 成功・警告の色は文字に使えないため、色は帯の面とアイコンに付け、文字は既定の色のままにする（design-a11y.md）
const statusIcons = {
  failure: { color: 'var(--mantine-color-red-9)', Icon: IconAlertCircle },
  offline: { color: 'var(--mantine-color-orange-9)', Icon: IconWifiOff },
  success: { color: 'var(--mantine-color-green-9)', Icon: IconCircleCheck },
} as const;

export type ResultCardStatus =
  | {
      readonly detail: null | ReactNode;
      readonly kind: 'failure';
      readonly label: string;
    }
  | {
      readonly detail: null | ReactNode;
      readonly kind: 'offline';
      readonly label: string;
    }
  | { readonly kind: 'pending'; readonly label: string }
  | { readonly kind: 'success'; readonly label: string };

// 待ちの光は、速い応答で一瞬だけ光らないよう決めた時間を超えてから出す（design-feedback.md）
const useDelayedVisibility = (isPending: boolean): boolean => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(false);
    if (!isPending) {
      return;
    }
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, pendingDelayMs);
    return (): void => {
      clearTimeout(timer);
    };
  }, [isPending]);

  return isVisible;
};

const StatusContent = ({
  isPendingVisible,
  status,
}: {
  readonly isPendingVisible: boolean;
  readonly status: ResultCardStatus;
}): React.JSX.Element => {
  if (status.kind === 'pending') {
    // 光を出すまでの間も、読み上げには待っていることを伝える
    return isPendingVisible ? (
      <Text c="dimmed" fw={700} size="sm">
        {status.label}
      </Text>
    ) : (
      <VisuallyHidden>{status.label}</VisuallyHidden>
    );
  }
  const { color, Icon } = statusIcons[status.kind];
  return (
    <>
      <Icon aria-hidden color={color} size={statusIconSize} style={{ flexShrink: 0 }} />
      <Stack gap={2}>
        <Text fw={700} size="sm">
          {status.label}
        </Text>
        {(status.kind === 'failure' || status.kind === 'offline') && status.detail !== null ? (
          <Text component="div" size="sm">
            {status.detail}
          </Text>
        ) : null}
      </Stack>
    </>
  );
};

// 1 つの物への操作（スキャン、照合、確定）の結果を、物の情報を見せたまま下の帯で返す（design-feedback.md）
export const ResultCard = ({
  children,
  status,
}: {
  readonly children: ReactNode;
  readonly status: ResultCardStatus;
}): React.JSX.Element => {
  const isPendingVisible = useDelayedVisibility(status.kind === 'pending');

  return (
    <Paper radius="default" style={{ overflow: 'hidden' }} withBorder>
      <Box p="md">{children}</Box>
      <Box
        aria-busy={status.kind === 'pending'}
        className={classes.status}
        mod={{ status: status.kind, visible: isPendingVisible }}
        role="status"
      >
        <StatusContent isPendingVisible={isPendingVisible} status={status} />
      </Box>
    </Paper>
  );
};
