import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { SettingsLayout } from '@template/ui/blocks/settings-layout/SettingsLayout';
import { TestLink } from '@template/ui/testing/TestRendering';

const meta = {
  args: {
    children: <p>プロフィールの設定</p>,
    linkComponent: TestLink,
    navigationItems: [
      { href: '/settings/profile', isCurrent: true, label: 'プロフィール' },
      { href: '/settings/notifications', isCurrent: false, label: '通知' },
      { href: '/settings/team', isCurrent: false, label: 'チーム' },
    ],
    navigationLabel: '設定のまとまり',
  },
  component: SettingsLayout,
} satisfies Meta<typeof SettingsLayout>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ideal: Story = {
  name: '理想状態の場合',
};
