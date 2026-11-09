import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { PasswordResetForm } from '@template/ui/blocks/password-reset-form/PasswordResetForm';
import { TestLink } from '@template/ui/testing/TestRendering';

const meta = {
  args: {
    backToLoginLabel: 'ログインに戻る',
    labels: {
      changeEmail: 'メールアドレスを直す',
      description: '登録したメールアドレスに、設定し直すためのリンクを送ります。',
      email: 'メールアドレス',
      emailInvalid: 'メールアドレスの形で入力してください',
      emailRequired: 'メールアドレスを入力してください',
      failureTitle: '送れませんでした',
      notReceived: 'メールが届かない場合',
      resend: 'もう一度送る',
      sentDescription: (email: string): string => `${email} にリンクを送りました。`,
      sentTitle: 'メールを送りました',
      submit: 'リンクを送る',
      submitting: '送っています…',
      title: 'パスワードを設定し直す',
    },
    linkComponent: TestLink,
    loginHref: '/login',
    onSubmit: () => Promise.resolve({ ok: true as const }),
  },
  component: PasswordResetForm,
} satisfies Meta<typeof PasswordResetForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ideal: Story = {
  name: '理想状態の場合',
};
