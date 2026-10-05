import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { CollectionSkeleton } from '@template/ui/blocks/collection-skeleton/CollectionSkeleton';

const meta = {
  args: {
    loadingLabel: '注文の一覧を読み込み中',
    rowCount: 5,
  },
  component: CollectionSkeleton,
} satisfies Meta<typeof CollectionSkeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  name: '読み込み中の場合',
};
