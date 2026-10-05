import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ThinkingOrbIcon } from '@/shared-components/thinking-orb-icon/ThinkingOrbIcon';

const meta = {
  args: { size: 'inline' },
  component: ThinkingOrbIcon,
} satisfies Meta<typeof ThinkingOrbIcon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ideal: Story = {
  name: '理想状態の場合',
};

export const SizeLarge: Story = {
  args: { size: 'large' },
  name: 'sizeがlargeの場合',
};
