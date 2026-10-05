import type { Metadata } from 'next';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { ColorSchemeScript } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { UiProvider } from '@template/ui/providers/UiProvider';
import { Geist, Geist_Mono } from 'next/font/google';

import '@/app/globals.css';
import { themeConfig } from '@/helpers/theme';
import { QueryProvider } from '@/shared-components/query-provider/QueryProvider';

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  description: 'Next.js App Router アプリケーションのテンプレート',
  title: 'Next.js Template',
};

// ColorSchemeScript が描画前に html へ data-mantine-color-scheme を付けるため、サーバーの HTML と食い違う。
// TSX に data-* 属性と spread props を書けない規約のため、mantineHtmlProps は使わずスクリプトに任せる
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <html
      className={`${geistSans.variable} ${geistMono.variable}`}
      lang="ja"
      suppressHydrationWarning
    >
      <head>
        <ColorSchemeScript forceColorScheme={themeConfig.appearance} />
      </head>
      <body>
        <UiProvider themeConfig={themeConfig}>
          <Notifications />
          <QueryProvider>{children}</QueryProvider>
        </UiProvider>
      </body>
    </html>
  );
}
