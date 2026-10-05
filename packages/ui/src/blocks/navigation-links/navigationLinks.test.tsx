import { NavigationLinks } from '@template/ui/blocks/navigation-links/NavigationLinks';
import { renderWithUi, TestLink } from '@template/ui/testing/TestRendering';
import { screen } from '@testing-library/react';
import { expect, it } from 'vitest';

const renderNavigationLinks = (): void => {
  renderWithUi(
    <NavigationLinks
      linkComponent={TestLink}
      navigationItems={[
        { href: '/orders', isCurrent: true, label: '注文' },
        { href: '/customers', isCurrent: false, label: '顧客' },
      ]}
    />
  );
};

it('navigationItemsを渡した場合、hrefへのリンクとして描画すること', () => {
  renderNavigationLinks();

  const actual = screen.getByRole('link', { name: '顧客' });

  expect(actual).toHaveAttribute('href', '/customers');
});

it('isCurrentがtrueの項目に、現在のページであることを示す属性を付けること', () => {
  renderNavigationLinks();

  const actual = screen.getByRole('link', { name: '注文' });

  expect(actual).toHaveAttribute('aria-current', 'page');
});

it('isCurrentがfalseの項目に、現在のページであることを示す属性を付けないこと', () => {
  renderNavigationLinks();

  const actual = screen.getByRole('link', { name: '顧客' });

  expect(actual).not.toHaveAttribute('aria-current');
});
