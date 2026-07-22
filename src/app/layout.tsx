import type { Metadata } from 'next';

import { Theme } from '@radix-ui/themes';
import { Geist, Geist_Mono } from 'next/font/google';
import '@radix-ui/themes/styles.css';

import '@/app/globals.css';
import { themeAccentColor } from '@/helpers/theme';
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <html className={`${geistSans.variable} ${geistMono.variable}`} lang="en">
      <body>
        <Theme accentColor={themeAccentColor}>
          <QueryProvider>{children}</QueryProvider>
        </Theme>
      </body>
    </html>
  );
}
