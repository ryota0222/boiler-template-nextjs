import type { ReactNode } from 'react';

import { Box, Group, Paper, Stack, Text } from '@mantine/core';

const cardWidth = 400;

// ログインまわりの画面の枠。灰色の背景の真ん中に小さなカードを 1 つ置き、下に利用規約などのリンクを並べる（design-recipes.md）。
// 認証の方式によらず同じ枠を使い、中身のフォームだけを差し替える
export const AuthLayout = ({
  applicationName,
  children,
  footerLinks,
}: {
  readonly applicationName: string;
  readonly children: ReactNode;
  readonly footerLinks: ReactNode;
}): React.JSX.Element => (
  <Box bg="var(--mantine-color-default-hover)" component="main" mih="100dvh" px="md" py="xl">
    <Stack
      align="center"
      gap="lg"
      justify="center"
      mih="calc(100dvh - 2 * var(--mantine-spacing-xl))"
    >
      <Text component="p" fw={700} size="xl">
        {applicationName}
      </Text>
      <Paper maw={cardWidth} p="xl" w="100%" withBorder>
        {children}
      </Paper>
      <Group gap="md">{footerLinks}</Group>
    </Stack>
  </Box>
);
