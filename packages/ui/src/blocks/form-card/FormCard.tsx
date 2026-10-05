'use client';

import type { ReactNode } from 'react';

import { Button, Card, Group, Stack, Text, Title } from '@mantine/core';

type StatusMessages = {
  readonly changed: string;
  readonly invalid: string;
  readonly submitting: string;
  readonly unchanged: string;
};

const selectStatusMessage = ({
  isDirty,
  isSubmitting,
  isValid,
  statusMessages,
}: {
  readonly isDirty: boolean;
  readonly isSubmitting: boolean;
  readonly isValid: boolean;
  readonly statusMessages: StatusMessages;
}): string => {
  if (isSubmitting) {
    return statusMessages.submitting;
  }

  if (!isDirty) {
    return statusMessages.unchanged;
  }

  if (!isValid) {
    return statusMessages.invalid;
  }

  return statusMessages.changed;
};

// 送信できるのは、変更があり入力が正しいときだけにする（design-form.md）。確認のダイアログを挟む送信は、
// 入力欄の Enter で送信しないよう送信ボタンを type="button" にする（design-a11y.md）
export const FormCard = ({
  cancelLabel,
  children,
  isDirty,
  isSubmitting,
  isValid,
  onCancel,
  onSubmit,
  requiresConfirmation,
  statusMessages,
  submitLabel,
  submittingLabel,
  title,
}: {
  readonly cancelLabel: string;
  readonly children: ReactNode;
  readonly isDirty: boolean;
  readonly isSubmitting: boolean;
  readonly isValid: boolean;
  readonly onCancel: () => void;
  readonly onSubmit: () => void;
  readonly requiresConfirmation: boolean;
  readonly statusMessages: StatusMessages;
  readonly submitLabel: string;
  readonly submittingLabel: string;
  readonly title: string;
}): React.JSX.Element => (
  <Card
    component="form"
    onSubmit={(event) => {
      event.preventDefault();
      if (!requiresConfirmation) {
        onSubmit();
      }
    }}
    padding="md"
    shadow="xs"
    withBorder
  >
    <Stack gap="lg">
      <Title order={2} size="h5">
        {title}
      </Title>
      <Stack gap="md">{children}</Stack>
      <Group justify="space-between">
        <Button onClick={onCancel} size="md" variant="subtle">
          {cancelLabel}
        </Button>
        <Group gap="sm" justify="flex-end" ml="auto">
          <Text role="status" size="xs">
            {selectStatusMessage({
              isDirty,
              isSubmitting,
              isValid,
              statusMessages,
            })}
          </Text>
          <Button
            disabled={!isDirty || !isValid}
            loading={isSubmitting}
            onClick={requiresConfirmation ? onSubmit : undefined}
            size="md"
            type={requiresConfirmation ? 'button' : 'submit'}
          >
            {isSubmitting ? submittingLabel : submitLabel}
          </Button>
        </Group>
      </Group>
    </Stack>
  </Card>
);
