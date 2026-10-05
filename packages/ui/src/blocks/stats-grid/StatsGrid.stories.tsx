import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { StatsGrid } from '@template/ui/blocks/stats-grid/StatsGrid';

const meta = {
  args: {
    stats: [
      { label: '今月の受注額', note: '前月より 12% 増', value: '¥1,234,000' },
      { label: '未発送', note: '3 日以上経過 2 件', value: '8 件' },
      { label: '今月の新規顧客', note: '前月と同じ', value: '5 社' },
      { label: '返品', note: '前月より 1 件減', value: '1 件' },
    ],
  },
  component: StatsGrid,
} satisfies Meta<typeof StatsGrid>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ideal: Story = {
  name: '理想状態の場合',
};

export const StatsEmpty: Story = {
  args: { stats: [] },
  name: 'statsが空の場合',
};
