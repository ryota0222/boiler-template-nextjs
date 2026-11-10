import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { OTPForm } from '@template/ui/blocks/otp-form/OTPForm';
import { fn } from 'storybook/test';

const meta = {
  args: {
    labels: {
      code: '確認コード',
      description: 'sato@example.com に 6 桁のコードを送りました。',
      resend: 'コードを送り直す',
      resendPrompt: '届かない場合',
      submit: '確かめる',
      submitting: '確かめています…',
      title: '確認コードを入れてください',
    },
    onResend: fn(),
    onSubmit: () =>
      Promise.resolve({
        message: 'コードが違います。メールに届いた 6 桁を入れてください',
        ok: false as const,
      }),
  },
  component: OTPForm,
} satisfies Meta<typeof OTPForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ideal: Story = {
  name: '理想状態の場合',
};
