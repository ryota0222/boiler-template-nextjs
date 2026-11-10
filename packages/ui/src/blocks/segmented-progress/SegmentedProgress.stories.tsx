import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { SegmentedProgress } from '@template/ui/blocks/segmented-progress/SegmentedProgress';

const meta = {
  args: {
    done: 3,
    label: '梱包済み',
    total: 5,
  },
  component: SegmentedProgress,
} satisfies Meta<typeof SegmentedProgress>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ideal: Story = {
  name: '理想状態の場合',
};

export const TotalMany: Story = {
  args: { done: 6, total: 18 },
  name: 'totalが18の場合',
};
