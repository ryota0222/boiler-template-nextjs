import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { UserAvatar } from '@template/ui/blocks/user-avatar/UserAvatar';

const meta = {
  args: {
    isDecorative: false,
    name: '山田 太郎',
    size: 'md',
    src: null,
  },
  component: UserAvatar,
} satisfies Meta<typeof UserAvatar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ideal: Story = {
  name: '理想状態の場合',
};

export const NameNull: Story = {
  args: { name: null },
  name: 'nameがnullの場合',
};
