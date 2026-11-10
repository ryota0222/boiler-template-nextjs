import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { MetricValue } from '@template/ui/blocks/metric-value/MetricValue';

const meta = {
  args: {
    size: 'xl',
    unit: '個',
    value: '12',
  },
  component: MetricValue,
} satisfies Meta<typeof MetricValue>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ideal: Story = {
  name: '理想状態の場合',
};

export const UnitNull: Story = {
  args: { unit: null, value: '4417' },
  name: 'unitがnullの場合',
};
