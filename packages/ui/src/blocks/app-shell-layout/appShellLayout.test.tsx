import { AppShellLayout } from '@template/ui/blocks/app-shell-layout/AppShellLayout';
import { NavigationLinks } from '@template/ui/blocks/navigation-links/NavigationLinks';
import { renderWithUi, TestLink } from '@template/ui/testing/TestRendering';
import { fireEvent, screen, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

const renderAppShellLayout = ({
  applicationName,
  isNavigationFullHeight,
}: {
  readonly applicationName: string | undefined;
  readonly isNavigationFullHeight: boolean;
}): void => {
  renderWithUi(
    <AppShellLayout
      accountMenu={{
        label: 'アカウント',
        logoutHref: '/login',
        logoutLabel: 'ログアウト',
      }}
      applicationName={applicationName}
      isNavigationFullHeight={isNavigationFullHeight}
      navigation={
        <NavigationLinks
          linkComponent={TestLink}
          navigationItems={[
            { href: '/orders', isCurrent: true, label: '注文' },
            { href: '/customers', isCurrent: false, label: '顧客' },
          ]}
        />
      }
      navigationLabel="メインメニュー"
      navigationWidth={240}
    >
      <p>画面の内容</p>
    </AppShellLayout>
  );
};

afterEach(() => {
  vi.restoreAllMocks();
});

// 狭い画面に合わせた表示の切り替えがないことを確かめるため、matchMedia が常に一致する状態にする
const emulateNarrowScreen = (): void => {
  vi.spyOn(globalThis, 'matchMedia').mockImplementation(
    (query: string) =>
      ({
        addEventListener: vi.fn(),
        addListener: vi.fn(),
        dispatchEvent: vi.fn(),
        matches: true,
        media: query,
        onchange: null,
        removeEventListener: vi.fn(),
        removeListener: vi.fn(),
      }) as MediaQueryList
  );
};

it('アプリの名前を渡した場合、ヘッダーに描画すること', () => {
  renderAppShellLayout({
    applicationName: '受発注管理',
    isNavigationFullHeight: false,
  });

  const actual = within(screen.getByRole('banner')).getByText('受発注管理');

  expect(actual).toBeInTheDocument();
});

it('アプリの名前がない場合、ヘッダーにアカウントのボタンだけを描画すること', () => {
  renderAppShellLayout({
    applicationName: undefined,
    isNavigationFullHeight: false,
  });

  const actual = screen.getByRole('banner');

  expect(actual).toHaveTextContent(/^アカウント$/);
});

it('navigationを渡した場合、ナビゲーションの中に描画すること', () => {
  renderAppShellLayout({
    applicationName: '受発注管理',
    isNavigationFullHeight: false,
  });

  const actual = within(screen.getByRole('navigation', { name: 'メインメニュー' })).getByRole(
    'link',
    { name: '顧客' }
  );

  expect(actual).toBeInTheDocument();
});

it('children を渡した場合、main の中に描画すること', () => {
  renderAppShellLayout({
    applicationName: '受発注管理',
    isNavigationFullHeight: false,
  });

  const actual = within(screen.getByRole('main')).getByText('画面の内容');

  expect(actual).toBeInTheDocument();
});

it('狭い画面の場合も、ナビゲーションを閉じずにフォーカスが入る状態で表示すること', () => {
  emulateNarrowScreen();
  renderAppShellLayout({
    applicationName: '受発注管理',
    isNavigationFullHeight: false,
  });

  const actual = document.querySelector('nav[inert]');

  expect(actual).not.toBeInTheDocument();
});

it('accountMenuを渡した場合、accountMenuのlabelを持つボタンをヘッダーに描画すること', () => {
  renderAppShellLayout({
    applicationName: '受発注管理',
    isNavigationFullHeight: false,
  });

  const actual = within(screen.getByRole('banner')).getByRole('button', {
    name: 'アカウント',
  });

  expect(actual).toBeInTheDocument();
});

it('アカウントのボタンを押した場合、メニューが開いていることを示す属性を付けること', () => {
  renderAppShellLayout({
    applicationName: '受発注管理',
    isNavigationFullHeight: false,
  });

  fireEvent.click(screen.getByRole('button', { name: 'アカウント' }));

  expect(screen.getByRole('button', { name: 'アカウント' })).toHaveAttribute(
    'aria-expanded',
    'true'
  );
});

it('アカウントのボタンを押した場合、logoutLabelの項目をlogoutHrefへのリンクとして描画すること', async () => {
  renderAppShellLayout({
    applicationName: '受発注管理',
    isNavigationFullHeight: false,
  });

  fireEvent.click(screen.getByRole('button', { name: 'アカウント' }));

  expect(await screen.findByRole('menuitem', { name: 'ログアウト' })).toHaveAttribute(
    'href',
    '/login'
  );
});

it('isNavigationFullHeightがtrueの場合、ナビゲーションを画面の上端から下端まで伸ばす配置にすること', () => {
  renderAppShellLayout({
    applicationName: '受発注管理',
    isNavigationFullHeight: true,
  });

  const actual = document.querySelector('[data-layout="alt"]');

  expect(actual).toBeInTheDocument();
});

it('狭い画面でisNavigationFullHeightがtrueの場合も、ナビゲーションを画面の上端から下端まで伸ばす配置にすること', () => {
  emulateNarrowScreen();
  renderAppShellLayout({
    applicationName: '受発注管理',
    isNavigationFullHeight: true,
  });

  const actual = document.querySelector('[data-layout="alt"]');

  expect(actual).toBeInTheDocument();
});

it('isNavigationFullHeightがfalseの場合、ナビゲーションをヘッダーの下に置く配置にすること', () => {
  renderAppShellLayout({
    applicationName: '受発注管理',
    isNavigationFullHeight: false,
  });

  const actual = document.querySelector('[data-layout="alt"]');

  expect(actual).not.toBeInTheDocument();
});
