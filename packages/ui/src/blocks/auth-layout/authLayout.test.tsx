import { AuthLayout } from '@template/ui/blocks/auth-layout/AuthLayout';
import { renderWithUi } from '@template/ui/testing/TestRendering';
import { screen } from '@testing-library/react';
import { expect, it } from 'vitest';

it('中身とリンクを渡した場合、アプリ名と一緒に出すこと', () => {
  renderWithUi(
    <AuthLayout applicationName="業務アプリ" footerLinks={<a href="/terms">利用規約</a>}>
      <p>ログインのフォーム</p>
    </AuthLayout>
  );

  const actual = [
    screen.getByText('業務アプリ'),
    screen.getByText('ログインのフォーム'),
    screen.getByRole('link', { name: '利用規約' }),
  ];

  expect(actual).toHaveLength(3);
});
