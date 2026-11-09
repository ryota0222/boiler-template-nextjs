import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { PendingValue } from '@template/ui/blocks/pending-value/PendingValue';

const meta = {
  args: {
    characters: 6,
    label: '置き場の番号を待っています',
  },
  component: PendingValue,
} satisfies Meta<typeof PendingValue>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  name: '読み込み中の場合',
};
