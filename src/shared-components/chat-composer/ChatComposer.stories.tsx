import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { fn, userEvent, within } from 'storybook/test';

import { ChatComposer } from '@/shared-components/chat-composer/ChatComposer';

const meta = {
  args: {
    isSending: false,
    labels: {
      input: 'メッセージ',
      placeholder: '質問を入力',
      send: '送信',
      sending: '送信しています…',
    },
    onSend: fn(),
  },
  component: ChatComposer,
} satisfies Meta<typeof ChatComposer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ideal: Story = {
  name: '理想状態の場合',
};

export const IsSending: Story = {
  args: { isSending: true },
  name: 'isSendingがtrueの場合',
};

// 文字を打って送信のボタンが押せる filled になった描画を axe に見せる
export const Filled: Story = {
  name: '入力済みの場合',
  play: async ({ canvasElement }): Promise<void> => {
    await userEvent.type(within(canvasElement).getByRole('textbox'), '在庫の数を教えて');
  },
};
