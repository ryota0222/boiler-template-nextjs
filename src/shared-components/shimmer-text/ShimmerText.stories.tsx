import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ShimmerText } from '@/shared-components/shimmer-text/ShimmerText';

const meta = {
  args: {
    children: '業務フローを作っています',
    size: 'sm',
  },
  component: ShimmerText,
} satisfies Meta<typeof ShimmerText>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ideal: Story = {
  name: '理想状態の場合',
};
