import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { PasswordLoginForm } from '@template/ui/blocks/password-login-form/PasswordLoginForm';
import { TestLink } from '@template/ui/testing/TestRendering';
import { expect, userEvent, within } from 'storybook/test';

const meta = {
  args: {
    forgotPasswordHref: '/reset',
    labels: {
      email: 'メールアドレス',
      emailInvalid: 'メールアドレスの形で入力してください',
      emailRequired: 'メールアドレスを入力してください',
      failureTitle: 'ログインできませんでした',
      forgotPassword: 'パスワードを忘れた場合',
      password: 'パスワード',
      passwordRequired: 'パスワードを入力してください',
      submit: 'ログインする',
      submitting: 'ログインしています…',
      title: 'ログイン',
    },
    linkComponent: TestLink,
    onSubmit: () =>
      Promise.resolve({ message: 'メールアドレスかパスワードが違います。', ok: false as const }),
  },
  component: PasswordLoginForm,
} satisfies Meta<typeof PasswordLoginForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ideal: Story = {
  name: '理想状態の場合',
};

export const InvalidInput: Story = {
  name: '入力エラーの場合',
  play: async ({ canvasElement }): Promise<void> => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'ログインする' }));
    await expect(
      await within(canvasElement).findByText('メールアドレスを入力してください')
    ).toBeInTheDocument();
  },
};

export const Error: Story = {
  name: 'エラーの場合',
  play: async ({ canvasElement }): Promise<void> => {
    const canvas = within(canvasElement);
    await userEvent.type(
      canvas.getByRole('textbox', { name: /メールアドレス/u }),
      'sato@example.com'
    );
    await userEvent.type(canvas.getByLabelText(/パスワード/u, { selector: 'input' }), 'secret');
    await userEvent.click(canvas.getByRole('button', { name: 'ログインする' }));
    await expect(
      await canvas.findByText('メールアドレスかパスワードが違います。')
    ).toBeInTheDocument();
  },
};
