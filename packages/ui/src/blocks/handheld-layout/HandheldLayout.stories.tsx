import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Button } from '@mantine/core';
import { HandheldLayout } from '@template/ui/blocks/handheld-layout/HandheldLayout';
import { SegmentedProgress } from '@template/ui/blocks/segmented-progress/SegmentedProgress';

const meta = {
  args: {
    children: <p>作業の中身</p>,
    footer: (
      <Button fullWidth size="lg">
        次の箱へ
      </Button>
    ),
    menu: null,
    offlineLabels: { description: 'つながるまで記録はしません', title: '通信が切れています' },
    progress: <SegmentedProgress done={6} label="梱包済み" total={18} />,
    title: 'パック · 持ち場 B-3',
  },
  component: HandheldLayout,
  parameters: { layout: 'fullscreen', viewport: { defaultViewport: 'mobile2' } },
} satisfies Meta<typeof HandheldLayout>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ideal: Story = {
  name: '理想状態の場合',
};
