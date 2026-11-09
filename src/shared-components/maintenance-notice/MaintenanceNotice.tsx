import { Stack, Text, Title } from '@mantine/core';
import { AuthLayout } from '@template/ui/blocks/auth-layout/AuthLayout';

// メンテナンス中に、すべての画面の代わりに出すお知らせ。再開の予定が決まっていれば、その時刻を出す
export const MaintenanceNotice = ({
  applicationName,
  untilLabel,
}: {
  readonly applicationName: string;
  readonly untilLabel: null | string;
}): React.JSX.Element => (
  <AuthLayout applicationName={applicationName} footerLinks={null}>
    <Stack gap="sm">
      <Title order={1} size="h3">
        メンテナンス中
      </Title>
      <Text>ただいまメンテナンスのため、ご利用いただけません。</Text>
      <Text>
        {untilLabel === null
          ? '再開まで、しばらくお待ちください。'
          : `${untilLabel}ごろに再開する予定です。`}
      </Text>
    </Stack>
  </AuthLayout>
);
