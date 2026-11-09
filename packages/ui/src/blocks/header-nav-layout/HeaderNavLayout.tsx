'use client';

import type { AccountMenuProperties } from '@template/ui/blocks/account-menu/AccountMenu';
import type { LinkComponent } from '@template/ui/types/linkComponent';
import type { ReactNode } from 'react';

import { AppShell, Box, Container, Group, Text } from '@mantine/core';
import { AccountMenu } from '@template/ui/blocks/account-menu/AccountMenu';
import classes from '@template/ui/blocks/header-nav-layout/HeaderNavLayout.module.css';

const headerHeight = 56;
const contentMaxWidth = 1120;

// 行き先が 5 つまでで、まとまりに分かれないアプリの枠。左のメニューを置かず、ヘッダーにリンクを並べて横の幅を中身に使う（design-recipes.md）
export const HeaderNavLayout = ({
  accountMenu,
  applicationName,
  children,
  linkComponent,
  navigationItems,
  navigationLabel,
}: {
  readonly accountMenu: AccountMenuProperties;
  readonly applicationName: string;
  readonly children: ReactNode;
  readonly linkComponent: LinkComponent;
  readonly navigationItems: readonly {
    readonly href: string;
    readonly isCurrent: boolean;
    readonly label: string;
  }[];
  readonly navigationLabel: string;
}): React.JSX.Element => (
  <AppShell header={{ height: headerHeight }} padding="md">
    <AppShell.Header>
      <Group gap="lg" h="100%" px="md" wrap="nowrap">
        <Text fw="bold" size="sm" style={{ flexShrink: 0 }}>
          {applicationName}
        </Text>
        <Box aria-label={navigationLabel} component="nav" h="100%" style={{ flex: 1, minWidth: 0 }}>
          <Group gap="xs" h="100%" wrap="nowrap">
            {navigationItems.map((navigationItem) => (
              <Box
                aria-current={navigationItem.isCurrent ? 'page' : undefined}
                className={classes.link}
                component={linkComponent}
                href={navigationItem.href}
                key={navigationItem.href}
              >
                {navigationItem.label}
              </Box>
            ))}
          </Group>
        </Box>
        <AccountMenu
          label={accountMenu.label}
          logoutHref={accountMenu.logoutHref}
          logoutLabel={accountMenu.logoutLabel}
        />
      </Group>
    </AppShell.Header>
    <AppShell.Main>
      <Container maw={contentMaxWidth} p={0}>
        {children}
      </Container>
    </AppShell.Main>
  </AppShell>
);
