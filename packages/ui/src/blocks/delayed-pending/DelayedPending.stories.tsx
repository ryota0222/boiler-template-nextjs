import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { DelayedPending } from '@template/ui/blocks/delayed-pending/DelayedPending';

const meta = {
  args: {
    children: '0.3 秒たつと出る待ちの表示',
  },
  component: DelayedPending,
} satisfies Meta<typeof DelayedPending>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  name: '読み込み中の場合',
};
