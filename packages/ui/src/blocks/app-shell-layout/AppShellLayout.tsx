'use client';

import type { ReactNode } from 'react';

import { AppShell, Group, Text } from '@mantine/core';
import { AccountMenu } from '@template/ui/blocks/account-menu/AccountMenu';

const headerHeight = 56;
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
        <AccountMenu
          label={accountMenu.label}
          logoutHref={accountMenu.logoutHref}
          logoutLabel={accountMenu.logoutLabel}
        />
      </Group>
    </AppShell.Header>
    <AppShell.Navbar aria-label={navigationLabel}>{navigation}</AppShell.Navbar>
    <AppShell.Main>{children}</AppShell.Main>
  </AppShell>
);
