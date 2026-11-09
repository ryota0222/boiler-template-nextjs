'use client';

import type { LinkComponent } from '@template/ui/types/linkComponent';
import type { ReactNode } from 'react';

import { Box, Group, NavLink, Stack } from '@mantine/core';

const navigationWidth = 220;
const contentMaxWidth = 720;

// まとまりが 3 つ以上ある設定の枠。左に設定のまとまりの一覧、右に今のまとまりを置く（design-recipes.md）。
// 1 行が長くなりすぎないよう、中身の幅は 720px までにする
export const SettingsLayout = ({
  children,
  linkComponent,
  navigationItems,
  navigationLabel,
}: {
  readonly children: ReactNode;
  readonly linkComponent: LinkComponent;
  readonly navigationItems: readonly {
    readonly href: string;
    readonly isCurrent: boolean;
    readonly label: string;
  }[];
  readonly navigationLabel: string;
}): React.JSX.Element => (
  <Group align="flex-start" gap="xl" wrap="nowrap">
    <Stack
      aria-label={navigationLabel}
      component="nav"
      gap={2}
      style={{ flexShrink: 0 }}
      w={navigationWidth}
    >
      {navigationItems.map((navigationItem) => (
        <NavLink
          active={navigationItem.isCurrent}
          aria-current={navigationItem.isCurrent ? 'page' : undefined}
          component={linkComponent}
          href={navigationItem.href}
          key={navigationItem.href}
          label={navigationItem.label}
        />
      ))}
    </Stack>
    <Box maw={contentMaxWidth} style={{ flex: 1, minWidth: 0 }}>
      {children}
    </Box>
  </Group>
);
