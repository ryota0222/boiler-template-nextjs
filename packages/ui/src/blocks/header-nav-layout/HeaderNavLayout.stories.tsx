import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { HeaderNavLayout } from '@template/ui/blocks/header-nav-layout/HeaderNavLayout';
import { TestLink } from '@template/ui/testing/TestRendering';

const meta = {
  args: {
    accountMenu: { label: '山田 太郎', logoutHref: '/login', logoutLabel: 'ログアウト' },
    applicationName: '業務アプリ',
    children: <p>画面の内容</p>,
    linkComponent: TestLink,
    navigationItems: [
      { href: '/', isCurrent: false, label: 'ホーム' },
      { href: '/customers', isCurrent: true, label: '取引先' },
      { href: '/orders', isCurrent: false, label: '注文' },
    ],
    navigationLabel: 'メインメニュー',
  },
  component: HeaderNavLayout,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof HeaderNavLayout>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ideal: Story = {
  name: '理想状態の場合',
};
