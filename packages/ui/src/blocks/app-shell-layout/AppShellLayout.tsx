'use client';

import type { ReactNode } from 'react';

import { AppShell, Button, Group, Menu, Text } from '@mantine/core';
import { IconChevronDown, IconLogout, IconUserCircle } from '@tabler/icons-react';

const headerHeight = 56;
const accountMenuIconSize = 16;
// 管理画面も業務アプリもスマートフォンの幅に合わせないため、画面の幅でナビゲーションを開閉式に切り替えない
const alwaysShownNavigationBreakpoint = 0;

export const AppShellLayout = ({
  accountMenu,
  applicationName,
  children,
  isNavigationFullHeight,
  navigation,
  navigationLabel,
  navigationWidth,
}: {
  readonly accountMenu: {
    readonly label: string;
    readonly logoutHref: string;
    readonly logoutLabel: string;
  };
  readonly applicationName: string | undefined;
  readonly children: ReactNode;
  readonly isNavigationFullHeight: boolean;
  readonly navigation: ReactNode;
  readonly navigationLabel: string;
  readonly navigationWidth: number;
}): React.JSX.Element => (
  <AppShell
    header={{ height: headerHeight }}
    layout={isNavigationFullHeight ? 'alt' : 'default'}
    navbar={{
      breakpoint: alwaysShownNavigationBreakpoint,
      width: navigationWidth,
    }}
    padding="md"
  >
    <AppShell.Header>
      {/* ヘッダーは高さが固定で、折り返すとはみ出す。アプリ名が長くてもアカウントのメニューを押せるよう、行は折り返さずアプリ名を省略する */}
      <Group
        h="100%"
        justify={applicationName === undefined ? 'flex-end' : 'space-between'}
        px="md"
        wrap="nowrap"
      >
        {applicationName !== undefined && (
          <Text fw="bold" miw={0} size="sm" truncate="end">
            {applicationName}
          </Text>
        )}
        {/* アカウントの操作は 1 回のセッションで何度も使わないため、内容の流れに置かずヘッダーのメニューに入れる（design-hierarchy.md） */}
        {/* Mantine 既定の withInitialFocusPlaceholder は role="menu" の直下に role="presentation" の div を置き、axe の aria-required-children に違反するため外す */}
        <Menu position="bottom-end" shadow="md" withInitialFocusPlaceholder={false}>
          <Menu.Target>
            <Button
              leftSection={<IconUserCircle aria-hidden size={accountMenuIconSize} />}
              rightSection={<IconChevronDown aria-hidden size={accountMenuIconSize} />}
              size="sm"
              variant="subtle"
            >
              {accountMenu.label}
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            {/* Next.js の Link は本番で表示中のリンクを先読みするため、linkComponent で描くとメニューを開いただけでログアウトの GET が走ってしまう。素のアンカーにして先読みを避ける */}
            <Menu.Item
              component="a"
              href={accountMenu.logoutHref}
              leftSection={<IconLogout aria-hidden size={accountMenuIconSize} />}
            >
              {accountMenu.logoutLabel}
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </AppShell.Header>
    <AppShell.Navbar aria-label={navigationLabel}>{navigation}</AppShell.Navbar>
    <AppShell.Main>{children}</AppShell.Main>
  </AppShell>
);
