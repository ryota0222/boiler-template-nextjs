import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ConfirmModal } from '@template/ui/blocks/confirm-modal/ConfirmModal';
import { fn } from 'storybook/test';

const meta = {
  args: {
    closeLabel: 'キャンセル',
    confirmLabel: '削除する',
    description: '削除したデータは保持しません。削除すると元に戻せません。',
    isConfirming: false,
    isDestructive: true,
    isOpened: true,
    onClose: fn(),
    onConfirm: fn(),
    summary: [
      { label: '注文番号', value: '#1024' },
      { label: '注文日', value: '2026/03/14' },
      { label: '合計', value: '¥6,036' },
    ],
    title: 'この操作は取り消せません',
  },
  component: ConfirmModal,
} satisfies Meta<typeof ConfirmModal>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ideal: Story = {
  name: '理想状態の場合',
};

export const IsDestructiveFalse: Story = {
  args: {
    confirmLabel: '登録する',
    description: '次の内容で注文を登録します。',
    isDestructive: false,
    title: '注文を登録しますか？',
  },
  name: 'isDestructiveがfalseの場合',
};

export const IsConfirmingTrue: Story = {
  args: { isConfirming: true },
  name: 'isConfirmingがtrueの場合',
};

export const SummaryEmpty: Story = {
  args: { summary: [] },
  name: 'summaryが空の場合',
};
