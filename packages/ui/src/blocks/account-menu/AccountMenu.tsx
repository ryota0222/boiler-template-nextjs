'use client';

import { Button, Menu } from '@mantine/core';
import { IconChevronDown, IconLogout } from '@tabler/icons-react';
import { UserAvatar } from '@template/ui/blocks/user-avatar/UserAvatar';

const accountMenuIconSize = 16;

export type AccountMenuProperties = {
  readonly label: string;
  readonly logoutHref: string;
  readonly logoutLabel: string;
};

// アカウントの操作は 1 回のセッションで何度も使わないため、内容の流れに置かずヘッダーのメニューに入れる（design-hierarchy.md）。
// 名前の横の頭文字のアイコンは、同じ名前を 2 回読ませないよう飾りにする
export const AccountMenu = ({
  label,
  logoutHref,
  logoutLabel,
}: AccountMenuProperties): React.JSX.Element => (
  // Mantine 既定の withInitialFocusPlaceholder は role="menu" の直下に role="presentation" の div を置き、axe の aria-required-children に違反するため外す
  <Menu position="bottom-end" shadow="md" withInitialFocusPlaceholder={false}>
    <Menu.Target>
      <Button
        color="gray"
        leftSection={<UserAvatar isDecorative name={label} size="sm" src={null} />}
        rightSection={<IconChevronDown aria-hidden size={accountMenuIconSize} />}
        size="sm"
        variant="subtle"
      >
        {label}
      </Button>
    </Menu.Target>
    <Menu.Dropdown>
      {/* Next.js の Link は本番で表示中のリンクを先読みするため、linkComponent で描くとメニューを開いただけでログアウトの GET が走ってしまう。素のアンカーにして先読みを避ける */}
      <Menu.Item
        component="a"
        href={logoutHref}
        leftSection={<IconLogout aria-hidden size={accountMenuIconSize} />}
      >
        {logoutLabel}
      </Menu.Item>
    </Menu.Dropdown>
  </Menu>
);
