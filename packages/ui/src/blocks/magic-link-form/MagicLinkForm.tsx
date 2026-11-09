'use client';

import type { AuthSubmitResult } from '@template/ui/types/authSubmitResult';
import type { ReactNode } from 'react';

import { Alert, Button, Group, Loader, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useState } from 'react';

const alertIconSize = 20;
const loaderSize = 16;
// メールアドレスとして送れる最低限の形だけを見る。届くかどうかは送ってみないと分からないため、細かくは確かめない
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

export type MagicLinkFormLabels = {
  readonly changeEmail: string;
  readonly description: string;
  readonly email: string;
  readonly emailInvalid: string;
  readonly emailRequired: string;
  readonly failureTitle: string;
  readonly notReceived: string;
  readonly resend: string;
  readonly sentDescription: (email: string) => string;
  readonly sentTitle: string;
  readonly submit: string;
  readonly submitting: string;
  readonly title: string;
};

// メールにリンクを送るフォーム。ログインのリンクにも、パスワードを設定し直すリンクにも使う。
// 送ったあとは同じカードの中で「メールを送りました」に変え、送り直すことと、メールアドレスを直すことを選べるようにする
export const MagicLinkForm = ({
  footer,
  labels,
  onSubmit,
}: {
  readonly footer: ReactNode;
  readonly labels: MagicLinkFormLabels;
  readonly onSubmit: (email: string) => Promise<AuthSubmitResult>;
}): React.JSX.Element => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<null | string>(null);
  const [failure, setFailure] = useState<null | string>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const validateEmail = (value: string): null | string => {
    if (value === '') {
      return labels.emailRequired;
    }
    return emailPattern.test(value) ? null : labels.emailInvalid;
  };

  const send = async (): Promise<void> => {
    const trimmed = email.trim();
    const nextError = validateEmail(trimmed);
    setError(nextError);
    if (nextError !== null) {
      return;
    }
    setIsSubmitting(true);
    setFailure(null);
    const result = await onSubmit(trimmed);
    setIsSubmitting(false);
    if (result.ok) {
      setIsSent(true);
      return;
    }
    setFailure(result.message);
  };

  const failureAlert =
    failure === null ? null : (
      <Alert
        color="red"
        icon={<IconAlertCircle aria-hidden size={alertIconSize} />}
        title={labels.failureTitle}
        variant="light"
      >
        {failure}
      </Alert>
    );
  const pendingIcon = isSubmitting ? <Loader color="gray" size={loaderSize} /> : null;

  if (isSent) {
    return (
      <Stack gap="lg">
        <Stack gap={6}>
          <Title order={1} size="h3">
            {labels.sentTitle}
          </Title>
          <Text c="dimmed" role="status" size="sm">
            {labels.sentDescription(email.trim())}
          </Text>
        </Stack>
        {failureAlert}
        <Stack gap="xs">
          <Text fw={700} size="sm">
            {labels.notReceived}
          </Text>
          <Group gap="sm">
            <Button
              disabled={isSubmitting}
              leftSection={pendingIcon}
              onClick={() => {
                void send();
              }}
              variant="default"
            >
              {isSubmitting ? labels.submitting : labels.resend}
            </Button>
            <Button
              disabled={isSubmitting}
              onClick={() => {
                setIsSent(false);
              }}
              variant="subtle"
            >
              {labels.changeEmail}
            </Button>
          </Group>
        </Stack>
        {footer}
      </Stack>
    );
  }

  return (
    <Stack gap="lg">
      <Stack gap={6}>
        <Title order={1} size="h3">
          {labels.title}
        </Title>
        <Text c="dimmed" size="sm">
          {labels.description}
        </Text>
      </Stack>
      {failureAlert}
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void send();
        }}
      >
        <Stack gap="md">
          <TextInput
            autoComplete="email"
            error={error}
            label={labels.email}
            onChange={(event) => {
              setEmail(event.currentTarget.value);
            }}
            required
            type="email"
            value={email}
          />
          <Button disabled={isSubmitting} fullWidth leftSection={pendingIcon} type="submit">
            {isSubmitting ? labels.submitting : labels.submit}
          </Button>
        </Stack>
      </form>
      {footer}
    </Stack>
  );
};
