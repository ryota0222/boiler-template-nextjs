import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { OfflineBanner } from '@template/ui/blocks/offline-banner/OfflineBanner';
import { expect, within } from 'storybook/test';

const meta = {
  args: {
    labels: { description: 'つながるまで記録はしません', title: '通信が切れています' },
  },
  component: OfflineBanner,
} satisfies Meta<typeof OfflineBanner>;

export default meta;

type Story = StoryObj<typeof meta>;

// 通信が切れたことをブラウザの出来事として送り、出てきた帯を axe に見せる
export const Offline: Story = {
  name: '通信が切れた場合',
  play: async ({ canvasElement }): Promise<void> => {
    globalThis.dispatchEvent(new Event('offline'));
    await expect(await within(canvasElement).findByRole('status')).toBeInTheDocument();
  },
};
