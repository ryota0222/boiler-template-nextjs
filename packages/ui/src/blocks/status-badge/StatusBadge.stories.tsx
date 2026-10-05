import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { StatusBadge } from '@template/ui/blocks/status-badge/StatusBadge';

const meta = {
  args: {
    children: '確認済み',
    size: 'md',
    tone: 'done',
  },
  component: StatusBadge,
} satisfies Meta<typeof StatusBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ideal: Story = {
  name: '理想状態の場合',
};

export const ToneFailed: Story = {
  args: { children: '失敗', tone: 'failed' },
  name: 'toneがfailedの場合',
};

export const ToneAttention: Story = {
  args: { children: '要確認', tone: 'attention' },
  name: 'toneがattentionの場合',
};

export const ToneAwaiting: Story = {
  args: { children: '業務の確認待ち', tone: 'awaiting' },
  name: 'toneがawaitingの場合',
};

export const ToneProcessing: Story = {
  args: { children: '画面を生成中', tone: 'processing' },
  name: 'toneがprocessingの場合',
};

export const ToneQueued: Story = {
  args: { children: '待機中', tone: 'queued' },
  name: 'toneがqueuedの場合',
};
