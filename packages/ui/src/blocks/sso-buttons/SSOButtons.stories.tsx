import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { SSOButtons } from '@template/ui/blocks/sso-buttons/SSOButtons';
import { fn } from 'storybook/test';

const meta = {
  args: {
    pendingProviderId: null,
    providers: [
      { id: 'google', label: 'Google でログイン', logoSrc: '/brand/google.svg', onClick: fn() },
      {
        id: 'microsoft',
        label: 'Microsoft アカウントでサインイン',
        logoSrc: '/brand/microsoft.svg',
        onClick: fn(),
      },
    ],
  },
  component: SSOButtons,
} satisfies Meta<typeof SSOButtons>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ideal: Story = {
  name: '理想状態の場合',
};

export const Loading: Story = {
  args: { pendingProviderId: 'google' },
  name: '読み込み中の場合',
};
