'use client';

import type { AuthSubmitResult } from '@template/ui/types/authSubmitResult';
import type { LinkComponent } from '@template/ui/types/linkComponent';

import {
  Alert,
  Anchor,
  Button,
  Group,
  Loader,
  PasswordInput,
  Stack,
  TextInput,
  Title,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useState } from 'react';

const alertIconSize = 20;
const loaderSize = 16;
// メールアドレスとして送れる最低限の形だけを見る。届くかどうかは送ってみないと分からないため、細かくは確かめない
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

export type PasswordLoginFormLabels = {
  readonly email: string;
  readonly emailInvalid: string;
  readonly emailRequired: string;
  readonly failureTitle: string;
  readonly forgotPassword: string;
  readonly password: string;
  readonly passwordRequired: string;
  readonly submit: string;
  readonly submitting: string;
  readonly title: string;
};

type FieldErrors = { readonly email: null | string; readonly password: null | string };

// メールアドレスとパスワードでログインするフォーム。送信の結果は呼ぶ側から受け取り、認証の仕組みには依存しない。
// 失敗はフォームの上に赤い Alert で出し、登録があるかどうかが分からない文を呼ぶ側が渡す
export const PasswordLoginForm = ({
  forgotPasswordHref,
  labels,
  linkComponent,
  onSubmit,
}: {
  readonly forgotPasswordHref: string;
  readonly labels: PasswordLoginFormLabels;
  readonly linkComponent: LinkComponent;
  readonly onSubmit: (values: {
    readonly email: string;
    readonly password: string;
  }) => Promise<AuthSubmitResult>;
}): React.JSX.Element => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({ email: null, password: null });
  const [failure, setFailure] = useState<null | string>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (value: string): null | string => {
    if (value.trim() === '') {
      return labels.emailRequired;
    }
    return emailPattern.test(value.trim()) ? null : labels.emailInvalid;
  };

  const submit = async (): Promise<void> => {
    const nextErrors = {
      email: validateEmail(email),
      password: password === '' ? labels.passwordRequired : null,
    };
    setErrors(nextErrors);
    if (nextErrors.email !== null || nextErrors.password !== null) {
      return;
    }
    setIsSubmitting(true);
    setFailure(null);
    const result = await onSubmit({ email: email.trim(), password });
    setIsSubmitting(false);
    if (!result.ok) {
      setFailure(result.message);
    }
  };

  return (
    <Stack gap="lg">
      <Title order={1} size="h3">
        {labels.title}
      </Title>
      {failure === null ? null : (
        <Alert
          color="red"
          icon={<IconAlertCircle aria-hidden size={alertIconSize} />}
          title={labels.failureTitle}
          variant="light"
        >
          {failure}
        </Alert>
      )}
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <Stack gap="md">
          <TextInput
            autoComplete="email"
            error={errors.email}
            label={labels.email}
            onBlur={() => {
              if (email !== '') {
                setErrors({ ...errors, email: validateEmail(email) });
              }
            }}
            onChange={(event) => {
              setEmail(event.currentTarget.value);
            }}
            required
            type="email"
            value={email}
          />
          <PasswordInput
            autoComplete="current-password"
            error={errors.password}
            label={labels.password}
            onChange={(event) => {
              setPassword(event.currentTarget.value);
            }}
            required
            value={password}
          />
          <Group justify="flex-end">
            <Anchor component={linkComponent} href={forgotPasswordHref} size="sm">
              {labels.forgotPassword}
            </Anchor>
          </Group>
          <Button
            disabled={isSubmitting}
            fullWidth
            leftSection={isSubmitting ? <Loader color="gray" size={loaderSize} /> : null}
            type="submit"
          >
            {isSubmitting ? labels.submitting : labels.submit}
          </Button>
        </Stack>
      </form>
    </Stack>
  );
};
