'use client';

import type { AuthSubmitResult } from '@template/ui/types/authSubmitResult';

import { Button, Group, Loader, PinInput, Stack, Text, Title } from '@mantine/core';
import { useState } from 'react';

const codeLength = 6;
const loaderSize = 16;

export type OTPFormLabels = {
  readonly code: string;
  readonly description: string;
  readonly resend: string;
  readonly resendPrompt: string;
  readonly submit: string;
  readonly submitting: string;
  readonly title: string;
};

// メールや SMS で届いた 6 桁の確認コードを入れるフォーム。6 桁そろうまで確かめるボタンは押せない。
// 違うときは欄の下に、どうすればよいかを 1 行で出す（文は呼ぶ側が渡す）
export const OTPForm = ({
  labels,
  onResend,
  onSubmit,
}: {
  readonly labels: OTPFormLabels;
  readonly onResend: () => void;
  readonly onSubmit: (code: string) => Promise<AuthSubmitResult>;
}): React.JSX.Element => {
  const [code, setCode] = useState('');
  const [failure, setFailure] = useState<null | string>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (): Promise<void> => {
    setIsSubmitting(true);
    setFailure(null);
    const result = await onSubmit(code);
    setIsSubmitting(false);
    if (!result.ok) {
      setFailure(result.message);
    }
  };

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
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <Stack gap="md">
          <Stack gap={6}>
            <Text component="label" fw={500} size="sm">
              {labels.code}
            </Text>
            <PinInput
              aria-label={labels.code}
              error={failure !== null}
              length={codeLength}
              onChange={(value) => {
                setCode(value);
                setFailure(null);
              }}
              oneTimeCode
              size="lg"
              type="number"
              value={code}
            />
            {failure === null ? null : (
              <Text c="var(--mantine-color-error)" role="alert" size="xs">
                {failure}
              </Text>
            )}
          </Stack>
          <Button
            disabled={code.length < codeLength || isSubmitting}
            fullWidth
            leftSection={isSubmitting ? <Loader color="gray" size={loaderSize} /> : null}
            type="submit"
          >
            {isSubmitting ? labels.submitting : labels.submit}
          </Button>
        </Stack>
      </form>
      <Group gap="xs">
        <Text c="dimmed" size="xs">
          {labels.resendPrompt}
        </Text>
        <Button onClick={onResend} size="compact-sm" variant="subtle">
          {labels.resend}
        </Button>
      </Group>
    </Stack>
  );
};
