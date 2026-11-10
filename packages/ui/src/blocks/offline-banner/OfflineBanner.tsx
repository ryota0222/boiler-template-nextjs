'use client';

import { Group, Stack, Text } from '@mantine/core';
import { useNetwork } from '@mantine/hooks';
import { IconWifiOff } from '@tabler/icons-react';

const iconSize = 20;

export type OfflineBannerLabels = {
  // 通信が切れている間に操作したものを、記録したかどうかを書く（例：つながるまで記録はしません）
  readonly description: string;
  readonly title: string;
};

// 通信が切れている間だけ画面の上に出し、つながったら消す。
// 警告の色は文字に使えないため、色は面とアイコンに付け、文字は既定の色のままにする（design-a11y.md）
export const OfflineBanner = ({
  labels,
}: {
  readonly labels: OfflineBannerLabels;
}): null | React.JSX.Element => {
  const { online } = useNetwork();

  if (online) {
    return null;
  }

  return (
    <Group
      align="flex-start"
      bg="var(--mantine-color-orange-light)"
      gap="xs"
      px="md"
      py="sm"
      role="status"
      wrap="nowrap"
    >
      <IconWifiOff
        aria-hidden
        color="var(--mantine-color-orange-9)"
        size={iconSize}
        style={{ flexShrink: 0 }}
      />
      <Stack gap={2}>
        <Text fw={700} size="sm">
          {labels.title}
        </Text>
        <Text size="sm">{labels.description}</Text>
      </Stack>
    </Group>
  );
};
