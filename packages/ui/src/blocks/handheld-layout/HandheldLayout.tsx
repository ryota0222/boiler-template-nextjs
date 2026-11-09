'use client';

import type { OfflineBannerLabels } from '@template/ui/blocks/offline-banner/OfflineBanner';
import type { ReactNode } from 'react';

import { Box, Group, Stack, Text } from '@mantine/core';
import { OfflineBanner } from '@template/ui/blocks/offline-banner/OfflineBanner';

const borderLine = '1px solid var(--mantine-color-default-border)';

// ハンディや片手で、スキャンしながら手順を進める作業の枠（design-recipes.md）。
// 上に作業の名前と進み具合、通信が切れている間はその下に帯、真ん中に作業、下に親指の届く固定のボタンを置く。
// 真ん中だけが縦に流れ、ボタンはいつも同じ場所に残る
export const HandheldLayout = ({
  children,
  footer,
  menu,
  offlineLabels,
  progress,
  title,
}: {
  readonly children: ReactNode;
  readonly footer: ReactNode;
  readonly menu: ReactNode;
  readonly offlineLabels: OfflineBannerLabels;
  readonly progress: ReactNode;
  readonly title: string;
}): React.JSX.Element => (
  <Stack gap={0} h="100dvh">
    <Stack component="header" gap="xs" px="md" py="sm" style={{ borderBottom: borderLine }}>
      <Group justify="space-between" wrap="nowrap">
        <Text component="h1" fw={700} size="md" truncate="end">
          {title}
        </Text>
        {menu}
      </Group>
      {progress}
    </Stack>
    <OfflineBanner labels={offlineLabels} />
    <Box component="main" px="md" py="md" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
      {children}
    </Box>
    <Box component="footer" pb="lg" pt="sm" px="md" style={{ borderTop: borderLine }}>
      {footer}
    </Box>
  </Stack>
);
