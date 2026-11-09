import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { SplitLayout } from '@template/ui/blocks/split-layout/SplitLayout';

const meta = {
  args: {
    detail: <p>山田商事の詳細</p>,
    list: <p>取引先の一覧</p>,
    listLabel: '取引先',
  },
  component: SplitLayout,
} satisfies Meta<typeof SplitLayout>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ideal: Story = {
  name: '理想状態の場合',
};
