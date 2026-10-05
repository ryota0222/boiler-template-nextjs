import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Text } from '@mantine/core';
import { AppShellLayout } from '@template/ui/blocks/app-shell-layout/AppShellLayout';
import { NavigationLinks } from '@template/ui/blocks/navigation-links/NavigationLinks';
import { TestLink } from '@template/ui/testing/TestRendering';
import { expect, userEvent, waitFor, within } from 'storybook/test';

const meta = {
  args: {
    accountMenu: {
      label: 'アカウント',
      logoutHref: '/login',
      logoutLabel: 'ログアウト',
    },
    applicationName: '受発注管理',
    children: <Text size="sm">画面の内容</Text>,
    isNavigationFullHeight: false,
    navigation: (
      <NavigationLinks
        linkComponent={TestLink}
        navigationItems={[
          { href: '/orders', isCurrent: true, label: '注文' },
          { href: '/customers', isCurrent: false, label: '顧客' },
          { href: '/products', isCurrent: false, label: '商品' },
        ]}
      />
    ),
    navigationLabel: 'メインメニュー',
    navigationWidth: 240,
  },
  component: AppShellLayout,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AppShellLayout>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ideal: Story = {
  name: '理想状態の場合',
};

// メニューはポータルで body の直下に描かれるため、Story の枠の外から探す
// Enter で開いた時点で、フォーカスが唯一の項目に直接移ることも確かめる（withInitialFocusPlaceholder={false}、design-a11y.md）
export const AccountMenuOpened: Story = {
  name: 'アカウントのメニューを開いた場合',
  play: async ({ canvasElement }): Promise<void> => {
    within(canvasElement).getByRole('button', { name: 'アカウント' }).focus();

    await userEvent.keyboard('{Enter}');

    const body = within(canvasElement.ownerDocument.body);
    const menu = await body.findByRole('menu');
    await waitFor(async () => {
      await expect(getComputedStyle(menu).opacity).toBe('1');
    });
    await expect(body.getByRole('menuitem', { name: 'ログアウト' })).toHaveFocus();
  },
};

// Escape で閉じたとき、フォーカスがアカウントのボタンに戻ることを確かめる
export const AccountMenuClosedWithEscape: Story = {
  name: 'アカウントのメニューをEscapeで閉じた場合',
  play: async ({ canvasElement }): Promise<void> => {
    const accountMenuButton = within(canvasElement).getByRole('button', {
      name: 'アカウント',
    });
    accountMenuButton.focus();
    await userEvent.keyboard('{Enter}');
    await within(canvasElement.ownerDocument.body).findByRole('menuitem', {
      name: 'ログアウト',
    });

    await userEvent.keyboard('{Escape}');

    await waitFor(async () => {
      await expect(accountMenuButton).toHaveFocus();
    });
  },
};
