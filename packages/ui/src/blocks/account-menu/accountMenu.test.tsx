import { AccountMenu } from '@template/ui/blocks/account-menu/AccountMenu';
import { renderWithUi } from '@template/ui/testing/TestRendering';
import { fireEvent, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

it('アカウントの名前を押した場合、ログアウトのリンクを出すこと', async () => {
  renderWithUi(<AccountMenu label="山田 太郎" logoutHref="/login" logoutLabel="ログアウト" />);

  fireEvent.click(screen.getByRole('button', { name: '山田 太郎' }));

  const actual = await screen.findByRole('menuitem', { name: 'ログアウト' });
  expect(actual).toHaveAttribute('href', '/login');
});
