import { PageHeader } from '@template/ui/blocks/page-header/PageHeader';
import { renderWithUi, TestLink } from '@template/ui/testing/TestRendering';
import { screen } from '@testing-library/react';
import { expect, it } from 'vitest';

const orderBreadcrumbs = [{ href: '/orders', label: '注文' }];

const renderPageHeader = (
  breadcrumbs: readonly { readonly href: string; readonly label: string }[]
): void => {
  renderWithUi(
    <PageHeader
      breadcrumbs={breadcrumbs}
      breadcrumbsLabel="現在の場所"
      linkComponent={TestLink}
      note={<p>3 件</p>}
      primaryAction={<button type="button">注文を登録</button>}
      title="注文 #1024"
    />
  );
};

it('title を渡した場合、ページの見出しとして描画すること', () => {
  renderPageHeader(orderBreadcrumbs);

  const actual = screen.getByRole('heading', { level: 1 });

  expect(actual).toHaveTextContent('注文 #1024');
});

it('上位の階層を渡した場合、パンくずにリンクとして描画すること', () => {
  renderPageHeader(orderBreadcrumbs);

  const actual = screen.getByRole('link', { name: '注文' });

  expect(actual).toHaveAttribute('href', '/orders');
});

it('パンくずの最後の項目に、現在のページであることを示す属性を付けること', () => {
  renderPageHeader(orderBreadcrumbs);

  const actual = screen
    .getByRole('navigation', { name: '現在の場所' })
    .querySelector('[aria-current="page"]');

  expect(actual).toHaveTextContent('注文 #1024');
});

it('パンくずの最後の項目をリンクにしないこと', () => {
  renderPageHeader(orderBreadcrumbs);

  const actual = screen.queryByRole('link', { name: '注文 #1024' });

  expect(actual).not.toBeInTheDocument();
});

it('補足を渡した場合、補足を描画すること', () => {
  renderPageHeader(orderBreadcrumbs);

  const actual = screen.getByText('3 件');

  expect(actual).toBeInTheDocument();
});

it('主な操作を渡した場合、主な操作を描画すること', () => {
  renderPageHeader(orderBreadcrumbs);

  const actual = screen.getByRole('button', { name: '注文を登録' });

  expect(actual).toBeInTheDocument();
});

it('パンくずの区切りの記号を読み上げないこと', () => {
  renderPageHeader(orderBreadcrumbs);

  const actual = screen.getByText('/');

  expect(actual).toHaveAttribute('aria-hidden', 'true');
});

it('パンくずの現在のページの名前が長い場合、折り返して画面の幅に収めること', () => {
  renderPageHeader(orderBreadcrumbs);

  const actual = screen
    .getByRole('navigation', { name: '現在の場所' })
    .querySelector('[aria-current="page"]');

  expect(actual).toHaveStyle({ whiteSpace: 'normal' });
});

it('上位の階層がない場合、パンくずを描画しないこと', () => {
  renderPageHeader([]);

  const actual = screen.queryByRole('navigation', { name: '現在の場所' });

  expect(actual).not.toBeInTheDocument();
});
