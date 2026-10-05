import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ErrorBanner } from '@template/ui/blocks/error-banner/ErrorBanner';
import { fn } from 'storybook/test';

const meta = {
  args: {
    description: '通信が切れた可能性があります。接続を確かめてから、もう一度読み込んでください。',
    onRetry: fn(),
    retryLabel: 'もう一度読み込む',
    title: '注文の一覧を読み込めませんでした',
  },
  component: ErrorBanner,
} satisfies Meta<typeof ErrorBanner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Error: Story = {
  name: 'エラーの場合',
};
