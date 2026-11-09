import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Anchor } from '@mantine/core';
import { AuthLayout } from '@template/ui/blocks/auth-layout/AuthLayout';

const meta = {
  args: {
    applicationName: '業務アプリ',
    children: <p>ログインのフォーム</p>,
    footerLinks: (
      <>
        <Anchor href="/terms" size="sm">
          利用規約
        </Anchor>
        <Anchor href="/privacy" size="sm">
          プライバシーポリシー
        </Anchor>
      </>
    ),
  },
  component: AuthLayout,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AuthLayout>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ideal: Story = {
  name: '理想状態の場合',
};
