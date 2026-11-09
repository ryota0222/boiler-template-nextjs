import { SettingsLayout } from '@template/ui/blocks/settings-layout/SettingsLayout';
import { renderWithUi, TestLink } from '@template/ui/testing/TestRendering';
import { screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';

it('今のまとまりのリンクを、今いるページとして示すこと', () => {
  renderWithUi(
    <SettingsLayout
      linkComponent={TestLink}
      navigationItems={[
        { href: '/settings/profile', isCurrent: true, label: 'プロフィール' },
        { href: '/settings/notifications', isCurrent: false, label: '通知' },
      ]}
      navigationLabel="設定のまとまり"
    >
      <p>プロフィールの設定</p>
    </SettingsLayout>
  );

  const actual = within(screen.getByRole('navigation', { name: '設定のまとまり' })).getByRole(
    'link',
    {
      name: 'プロフィール',
    }
  );

  expect(actual).toHaveAttribute('aria-current', 'page');
});
