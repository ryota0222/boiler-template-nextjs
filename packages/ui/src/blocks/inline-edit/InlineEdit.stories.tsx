import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { InlineEditSaveResult } from '@template/ui/blocks/inline-edit/InlineEdit';

import { InlineEdit } from '@template/ui/blocks/inline-edit/InlineEdit';
import { expect, userEvent, waitFor, within } from 'storybook/test';

const meta = {
  args: {
    hasViewingLabel: true,
    label: '取引先名',
    labels: {
      cancel: 'やめる',
      edit: '直す',
      save: '保存する',
      saved: '保存しました',
      saving: '保存しています…',
    },
    onSave: (): Promise<InlineEditSaveResult> => Promise.resolve({ ok: true }),
    value: '株式会社サンプル',
  },
  component: InlineEdit,
} satisfies Meta<typeof InlineEdit>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ideal: Story = {
  name: '理想状態の場合',
};

// 直すボタンを押して入力欄と保存のボタンを出した後の描画を axe に見せる
export const Editing: Story = {
  name: '編集中の場合',
  play: async ({ canvasElement }): Promise<void> => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: '直す' }));
    await waitFor(async () => {
      await expect(within(canvasElement).getByRole('textbox')).toBeInTheDocument();
    });
  },
};

export const InvalidInput: Story = {
  args: {
    onSave: (): Promise<InlineEditSaveResult> =>
      Promise.resolve({ message: '取引先名を入力してください', ok: false }),
  },
  name: '入力エラーの場合',
  play: async ({ canvasElement }): Promise<void> => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '直す' }));
    await userEvent.click(await canvas.findByRole('button', { name: '保存する' }));
    await expect(await canvas.findByText('取引先名を入力してください')).toBeInTheDocument();
  },
};
