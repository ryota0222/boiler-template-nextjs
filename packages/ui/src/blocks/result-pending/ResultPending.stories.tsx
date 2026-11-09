import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ResultPending } from '@template/ui/blocks/result-pending/ResultPending';

const meta = {
  args: {
    height: 48,
    label: '照合の結果を待っています',
  },
  component: ResultPending,
} satisfies Meta<typeof ResultPending>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  name: '読み込み中の場合',
};
