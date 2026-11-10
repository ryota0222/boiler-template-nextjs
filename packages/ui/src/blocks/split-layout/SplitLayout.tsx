import type { ReactNode } from 'react';

import { Box, Group, ScrollArea } from '@mantine/core';

const listWidth = 360;

// 何件も続けて見て処理する画面（承認、仕分け）の枠。左に一覧、右に選んだものの詳細を並べ、一覧の位置を失わずに次へ進める（design-recipes.md）。
// 左右はそれぞれで縦に流れる
export const SplitLayout = ({
  detail,
  list,
  listLabel,
}: {
  readonly detail: ReactNode;
  readonly list: ReactNode;
  readonly listLabel: string;
}): React.JSX.Element => (
  <Group align="stretch" gap={0} h="100%" wrap="nowrap">
    <Box
      aria-label={listLabel}
      component="section"
      style={{ borderRight: '1px solid var(--mantine-color-default-border)', flexShrink: 0 }}
      w={listWidth}
    >
      <ScrollArea h="100%">{list}</ScrollArea>
    </Box>
    <Box style={{ flex: 1, minWidth: 0 }}>
      <ScrollArea h="100%">
        <Box px="xl" py="lg">
          {detail}
        </Box>
      </ScrollArea>
    </Box>
  </Group>
);
