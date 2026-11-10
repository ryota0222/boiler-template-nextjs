import type { Metadata } from 'next';

import { connection } from 'next/server';

import { metadata as rootMetadata } from '@/app/layout';
import { formatMaintenanceUntil, readMaintenanceSettings } from '@/helpers/maintenance';
import { MaintenanceNotice } from '@/shared-components/maintenance-notice/MaintenanceNotice';

const appName = typeof rootMetadata.title === 'string' ? rootMetadata.title : '';

export const metadata: Metadata = {
  description: 'メンテナンス中のお知らせ',
  title: `メンテナンス中 | ${appName}`,
};

// proxy.ts がメンテナンス中にだけ、すべての画面をここへ差し替える。再開の時刻は環境変数から読むため、毎回サーバーで描く
export default async function Page(): Promise<React.JSX.Element> {
  await connection();
  const { until } = readMaintenanceSettings(process.env);

  return (
    <MaintenanceNotice
      applicationName={appName}
      untilLabel={until === null ? null : formatMaintenanceUntil(until)}
    />
  );
}
