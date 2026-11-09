import { PasswordResetForm } from '@template/ui/blocks/password-reset-form/PasswordResetForm';
import { renderWithUi, TestLink } from '@template/ui/testing/TestRendering';
import { screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

it('描いた場合、ログインに戻るリンクを出すこと', () => {
  renderWithUi(
    <PasswordResetForm
      backToLoginLabel="ログインに戻る"
      labels={{
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
      }}
      linkComponent={TestLink}
      loginHref="/login"
      onSubmit={vi.fn()}
    />
  );

  const actual = screen.getByRole('link', { name: 'ログインに戻る' });

  expect(actual).toHaveAttribute('href', '/login');
});
