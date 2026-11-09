import { OTPForm } from '@template/ui/blocks/otp-form/OTPForm';
import { renderWithUi } from '@template/ui/testing/TestRendering';
import { screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

const labels = {
  code: '確認コード',
  description: 'sato@example.com に 6 桁のコードを送りました。',
  resend: 'コードを送り直す',
  resendPrompt: '届かない場合',
  submit: '確かめる',
  submitting: '確かめています…',
  title: '確認コードを入れてください',
} as const;

it('6 桁そろっていない場合、確かめるボタンを押せないこと', () => {
  renderWithUi(<OTPForm labels={labels} onResend={vi.fn()} onSubmit={vi.fn()} />);

  const actual = screen.getByRole('button', { name: '確かめる' });

  expect(actual).toBeDisabled();
});
