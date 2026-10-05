import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Button, Text } from '@mantine/core';
import { PageHeader } from '@template/ui/blocks/page-header/PageHeader';
import { TestLink } from '@template/ui/testing/TestRendering';

const meta = {
  args: {
    breadcrumbs: [{ href: '/orders', label: '注文' }],
    breadcrumbsLabel: '現在の場所',
    linkComponent: TestLink,
    note: (
      <Text c="dimmed" size="xs">
        2026/03/14 に登録
      </Text>
    ),
    primaryAction: <Button>注文を編集</Button>,
    title: '注文 #1024',
  },
  component: PageHeader,
} satisfies Meta<typeof PageHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ideal: Story = {
  name: '理想状態の場合',
};

export const PrimaryActionNull: Story = {
  args: { primaryAction: null },
  name: 'primaryActionがnullの場合',
};
