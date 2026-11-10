import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Text } from '@mantine/core';

import { ChatMessage } from '@/shared-components/chat-message/ChatMessage';

const meta = {
  args: {
    children: <Text size="sm">倉庫Aの在庫は 128 個です。</Text>,
    isWriting: false,
    speaker: 'assistant',
    speakerLabel: 'AI',
  },
  component: ChatMessage,
} satisfies Meta<typeof ChatMessage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ideal: Story = {
  name: '理想状態の場合',
};

export const SpeakerUser: Story = {
  args: {
    children: <Text size="sm">倉庫Aの在庫の数を教えて</Text>,
    speaker: 'user',
    speakerLabel: 'あなた',
  },
  name: 'speakerがuserの場合',
};

export const IsWriting: Story = {
  args: { isWriting: true },
  name: 'isWritingがtrueの場合',
};
