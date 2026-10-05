import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ThinkingIndicator } from '@/shared-components/thinking-indicator/ThinkingIndicator';

const meta = {
  args: {
    label: '回答を考えています…',
  },
  component: ThinkingIndicator,
} satisfies Meta<typeof ThinkingIndicator>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ideal: Story = {
  name: '理想状態の場合',
};
