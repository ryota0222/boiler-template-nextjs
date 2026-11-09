import type { AuthSubmitResult } from '@template/ui/types/authSubmitResult';

import { PasswordLoginForm } from '@template/ui/blocks/password-login-form/PasswordLoginForm';
import { renderWithUi, TestLink } from '@template/ui/testing/TestRendering';
import { fireEvent, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

const labels = {
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
} as const;

type SubmitLogin = (values: {
  readonly email: string;
  readonly password: string;
}) => Promise<AuthSubmitResult>;

const renderForm = (onSubmit: SubmitLogin): void => {
  renderWithUi(
    <PasswordLoginForm
      forgotPasswordHref="/reset"
      labels={labels}
      linkComponent={TestLink}
      onSubmit={onSubmit}
    />
  );
};

it('何も入れずに送った場合、両方の欄に入力を求める文を出し、送信しないこと', () => {
  const onSubmit = vi.fn<SubmitLogin>();
  renderForm(onSubmit);

  fireEvent.click(screen.getByRole('button', { name: 'ログインする' }));

  expect(screen.getByText('メールアドレスを入力してください')).toBeInTheDocument();
  expect(screen.getByText('パスワードを入力してください')).toBeInTheDocument();
  expect(onSubmit).not.toHaveBeenCalled();
});

it('ログインに失敗した場合、渡された理由をフォームの上に出すこと', async () => {
  renderForm(
    vi
      .fn<SubmitLogin>()
      .mockResolvedValue({ message: 'メールアドレスかパスワードが違います。', ok: false })
  );
  fireEvent.change(screen.getByRole('textbox', { name: /メールアドレス/u }), {
    target: { value: 'sato@example.com' },
  });
  fireEvent.change(screen.getByLabelText(/パスワード/u, { selector: 'input' }), {
    target: { value: 'secret' },
  });

  fireEvent.click(screen.getByRole('button', { name: 'ログインする' }));

  const actual = await screen.findByText('メールアドレスかパスワードが違います。');
  expect(actual).toBeInTheDocument();
});
