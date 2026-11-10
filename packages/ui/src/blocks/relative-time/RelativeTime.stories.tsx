import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { RelativeTime } from '@template/ui/blocks/relative-time/RelativeTime';

const meta = {
  args: {
    now: new Date('2026-11-10T09:00:00+09:00'),
    value: new Date('2026-11-10T08:57:00+09:00'),
  },
  component: RelativeTime,
} satisfies Meta<typeof RelativeTime>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ideal: Story = {
  name: '理想状態の場合',
};
