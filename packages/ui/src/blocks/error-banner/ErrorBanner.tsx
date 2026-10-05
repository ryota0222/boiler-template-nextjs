import { Alert, Button, Stack, Text } from '@mantine/core';
import { IconAlertCircle, IconRefresh } from '@tabler/icons-react';

const sectionIconSize = 16;

const alertIconSize = 16;

// 利用者が直せない失敗は、条件が変わるまで消さないため閉じるボタンを持たない（design-feedback.md）
export const ErrorBanner = ({
  description,
  onRetry,
  retryLabel,
  title,
}: {
  readonly description: string;
  readonly onRetry: () => void;
  readonly retryLabel: string;
  readonly title: string;
}): React.JSX.Element => (
  <Alert
    color="red"
    icon={<IconAlertCircle aria-hidden size={alertIconSize} />}
    title={title}
    variant="light"
  >
    <Stack align="flex-start" gap="sm">
      <Text size="sm">{description}</Text>
      <Button
        leftSection={<IconRefresh aria-hidden size={sectionIconSize} />}
        onClick={onRetry}
        size="sm"
        variant="default"
      >
        {retryLabel}
      </Button>
    </Stack>
  </Alert>
);
