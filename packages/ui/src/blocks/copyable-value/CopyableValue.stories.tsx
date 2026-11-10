import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { CopyableValue } from '@template/ui/blocks/copyable-value/CopyableValue';

const meta = {
  args: {
    copiedLabel: 'コピーしました',
    copyLabel: '注文番号をコピーする',
    value: 'ORD-1024',
  },
  component: CopyableValue,
} satisfies Meta<typeof CopyableValue>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ideal: Story = {
  name: '理想状態の場合',
};
