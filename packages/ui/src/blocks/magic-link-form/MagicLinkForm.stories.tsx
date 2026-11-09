import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { MagicLinkForm } from '@template/ui/blocks/magic-link-form/MagicLinkForm';
import { expect, userEvent, within } from 'storybook/test';

const meta = {
  args: {
    footer: null,
    labels: {
      changeEmail: 'メールアドレスを直す',
      description: 'メールアドレスに、ログインのリンクを送ります。',
      email: 'メールアドレス',
      emailInvalid: 'メールアドレスの形で入力してください',
      emailRequired: 'メールアドレスを入力してください',
      failureTitle: '送れませんでした',
      notReceived: 'メールが届かない場合',
      resend: 'もう一度送る',
      sentDescription: (email: string): string =>
        `${email} に届いたメールのリンクを開くと、ログインできます。リンクは 15 分で使えなくなります。`,
      sentTitle: 'メールを送りました',
      submit: 'リンクを送る',
      submitting: '送っています…',
      title: 'ログイン',
    },
    onSubmit: () => Promise.resolve({ ok: true as const }),
  },
  component: MagicLinkForm,
} satisfies Meta<typeof MagicLinkForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ideal: Story = {
  name: '理想状態の場合',
};

export const InvalidInput: Story = {
  name: '入力エラーの場合',
  play: async ({ canvasElement }): Promise<void> => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'リンクを送る' }));
    await expect(
      await within(canvasElement).findByText('メールアドレスを入力してください')
    ).toBeInTheDocument();
  },
};

// 送ったあとの「メールを送りました」の描画を axe に見せる
export const Sent: Story = {
  name: '送信後の場合',
  play: async ({ canvasElement }): Promise<void> => {
    const canvas = within(canvasElement);
    await userEvent.type(
      canvas.getByRole('textbox', { name: /メールアドレス/u }),
      'sato@example.com'
    );
    await userEvent.click(canvas.getByRole('button', { name: 'リンクを送る' }));
    await expect(await canvas.findByRole('status')).toBeInTheDocument();
  },
};
