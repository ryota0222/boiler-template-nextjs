import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Badge, Button } from '@mantine/core';
import { DetailCard } from '@template/ui/blocks/detail-card/DetailCard';

const meta = {
  args: {
    action: (
      <Button size="sm" variant="outline">
        配送先を編集
      </Button>
    ),
    items: [
      { label: '住所', value: '東京都渋谷区神南 1-2-3' },
      { label: '電話番号', value: '03-0000-0000' },
      {
        label: '状態',
        value: (
          <Badge color="orange" variant="dot">
            未発送
          </Badge>
        ),
      },
      { label: '希望日', value: '2026/03/20' },
    ],
    title: '配送先',
  },
  component: DetailCard,
} satisfies Meta<typeof DetailCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ideal: Story = {
  name: '理想状態の場合',
};

export const ActionNull: Story = {
  args: { action: null },
  name: 'actionがnullの場合',
};
