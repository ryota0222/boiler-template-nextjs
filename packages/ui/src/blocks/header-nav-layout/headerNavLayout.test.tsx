import { HeaderNavLayout } from '@template/ui/blocks/header-nav-layout/HeaderNavLayout';
import { renderWithUi, TestLink } from '@template/ui/testing/TestRendering';
import { screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';

const renderLayout = (): void => {
  renderWithUi(
    <HeaderNavLayout
      accountMenu={{ label: '山田 太郎', logoutHref: '/login', logoutLabel: 'ログアウト' }}
      applicationName="業務アプリ"
      linkComponent={TestLink}
      navigationItems={[
        { href: '/', isCurrent: false, label: 'ホーム' },
        { href: '/customers', isCurrent: true, label: '取引先' },
      ]}
      navigationLabel="メインメニュー"
    >
      <p>画面の内容</p>
    </HeaderNavLayout>
  );
};

it('今いるページのリンクを、今いるページとして示すこと', () => {
  renderLayout();

  const actual = within(screen.getByRole('navigation', { name: 'メインメニュー' })).getByRole(
    'link',
    {
      name: '取引先',
    }
  );

  expect(actual).toHaveAttribute('aria-current', 'page');
});

it('中身を渡した場合、ヘッダーの下に出すこと', () => {
  renderLayout();

  const actual = screen.getByText('画面の内容');

  expect(actual).toBeInTheDocument();
});
