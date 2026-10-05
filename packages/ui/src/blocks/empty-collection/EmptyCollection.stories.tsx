import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Button } from '@mantine/core';
import { EmptyCollection } from '@template/ui/blocks/empty-collection/EmptyCollection';
import { fn } from 'storybook/test';

const meta = {
  args: {
    empty: {
      action: <Button>最初の注文を登録</Button>,
      description: '注文を登録すると、ここに一覧で表示されます',
      title: '注文はまだありません',
    },
    filtered: null,
  },
  component: EmptyCollection,
} satisfies Meta<typeof EmptyCollection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  name: '空の場合',
};

export const Filtered: Story = {
  args: {
    filtered: {
      clearLabel: '条件をすべて解除',
      description: '検索: 田中、状態: 未発送 に一致する注文はありません',
      onClear: fn(),
      title: '条件に一致する注文はありません',
    },
  },
  name: 'filteredを渡した場合',
};
