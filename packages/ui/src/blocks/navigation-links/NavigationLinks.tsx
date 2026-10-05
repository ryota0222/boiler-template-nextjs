'use client';

import type { LinkComponent } from '@template/ui/types/linkComponent';

import { NavLink, Stack } from '@mantine/core';

export const NavigationLinks = ({
  linkComponent,
  navigationItems,
}: {
  readonly linkComponent: LinkComponent;
  readonly navigationItems: readonly {
    readonly href: string;
    readonly isCurrent: boolean;
    readonly label: string;
  }[];
}): React.JSX.Element => (
  <Stack gap={0} p="xs">
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
);
