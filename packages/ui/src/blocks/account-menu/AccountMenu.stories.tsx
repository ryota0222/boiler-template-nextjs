import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { AccountMenu } from '@template/ui/blocks/account-menu/AccountMenu';
import { expect, userEvent, waitFor, within } from 'storybook/test';

const meta = {
  args: { label: '山田 太郎', logoutHref: '/login', logoutLabel: 'ログアウト' },
  component: AccountMenu,
} satisfies Meta<typeof AccountMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ideal: Story = {
  name: '理想状態の場合',
};

export const Opened: Story = {
  name: '開いた場合',
  play: async ({ canvasElement }): Promise<void> => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: '山田 太郎' }));
    const menu = await within(canvasElement.ownerDocument.body).findByRole('menu');
    await waitFor(async () => {
      await expect(getComputedStyle(menu).opacity).toBe('1');
    });
  },
};
