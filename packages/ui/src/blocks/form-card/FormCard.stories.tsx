import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { NumberInput, TextInput } from '@mantine/core';
import { FormCard } from '@template/ui/blocks/form-card/FormCard';
import { fn } from 'storybook/test';

const meta = {
  args: {
    cancelLabel: '編集をやめる',
    children: (
      <>
        <TextInput label="住所" required />
        <NumberInput label="数量" thousandSeparator="," />
      </>
    ),
    isDirty: true,
    isSubmitting: false,
    isValid: true,
    onCancel: fn(),
    onSubmit: fn(),
    requiresConfirmation: false,
    statusMessages: {
      changed: '変更があります',
      invalid: '入力に誤りがあります。赤い説明の項目を直してください',
      submitting: '保存しています',
      unchanged: '変更はまだありません',
    },
    submitLabel: '保存する',
    submittingLabel: '保存中…',
    title: '配送先',
  },
  component: FormCard,
} satisfies Meta<typeof FormCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ideal: Story = {
  name: '理想状態の場合',
};

export const IsDirtyFalse: Story = {
  args: { isDirty: false },
  name: 'isDirtyがfalseの場合',
};

export const InvalidInput: Story = {
  args: {
    children: (
      <>
        <TextInput error="住所を入力してください" label="住所" required />
        <NumberInput label="数量" thousandSeparator="," />
      </>
    ),
    isValid: false,
  },
  name: '入力エラーの場合',
};

export const IsSubmittingTrue: Story = {
  args: { isSubmitting: true },
  name: 'isSubmittingがtrueの場合',
};
