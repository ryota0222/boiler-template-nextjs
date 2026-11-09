import { MagicLinkForm } from '@template/ui/blocks/magic-link-form/MagicLinkForm';
import { renderWithUi } from '@template/ui/testing/TestRendering';
import { fireEvent, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

const labels = {
  changeEmail: 'メールアドレスを直す',
  description: 'メールアドレスに、ログインのリンクを送ります。',
  email: 'メールアドレス',
  emailInvalid: 'メールアドレスの形で入力してください',
  emailRequired: 'メールアドレスを入力してください',
  failureTitle: '送れませんでした',
  notReceived: 'メールが届かない場合',
  resend: 'もう一度送る',
  sentDescription: (email: string): string =>
    `${email} に届いたメールのリンクを開くと、ログインできます。`,
  sentTitle: 'メールを送りました',
  submit: 'リンクを送る',
  submitting: '送っています…',
  title: 'ログイン',
} as const;

it('送れた場合、送り先を書いた案内に変えること', async () => {
  renderWithUi(
    <MagicLinkForm
      footer={null}
      labels={labels}
      onSubmit={vi.fn().mockResolvedValue({ ok: true })}
    />
  );
  fireEvent.change(screen.getByRole('textbox', { name: /メールアドレス/u }), {
    target: { value: 'sato@example.com' },
  });

  fireEvent.click(screen.getByRole('button', { name: 'リンクを送る' }));

  const actual = await screen.findByRole('status');
  expect(actual).toHaveTextContent(
    'sato@example.com に届いたメールのリンクを開くと、ログインできます。'
  );
});

it('メールアドレスの形でない場合、送らずに直し方を出すこと', () => {
  const onSubmit = vi.fn();
  renderWithUi(<MagicLinkForm footer={null} labels={labels} onSubmit={onSubmit} />);
  fireEvent.change(screen.getByRole('textbox', { name: /メールアドレス/u }), {
    target: { value: 'sato@' },
  });

  fireEvent.click(screen.getByRole('button', { name: 'リンクを送る' }));

  expect(screen.getByText('メールアドレスの形で入力してください')).toBeInTheDocument();
  expect(onSubmit).not.toHaveBeenCalled();
});
