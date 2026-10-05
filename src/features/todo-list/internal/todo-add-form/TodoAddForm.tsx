'use client';

import { Alert, Button, Group, Loader, Stack, TextInput } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import { todoCreationMutationOptions } from '@/api/todo/mutations';

const alertIconSize = 16;
const maximumTitleLength = 100;

export const TodoAddForm = (): React.JSX.Element => {
  const [title, setTitle] = useState('');
  const [isTouched, setIsTouched] = useState(false);
  const creationMutation = useMutation(todoCreationMutationOptions);

  const trimmedTitle = title.trim();
  const isTitleEmpty = trimmedTitle === '';

  return (
    <Stack gap="xs">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          creationMutation.mutate(trimmedTitle, {
            onSuccess: (result) => {
              if (!result.ok) {
                return;
              }

              setTitle('');
              setIsTouched(false);
            },
          });
        }}
      >
        <Group align="flex-start">
          <TextInput
            error={isTouched && isTitleEmpty ? 'Todo の内容を入力してください' : null}
            label="Todo"
            maxLength={maximumTitleLength}
            onBlur={() => {
              setIsTouched(true);
            }}
            onChange={(event) => {
              setTitle(event.currentTarget.value);
            }}
            required
            style={{ flex: 1 }}
            value={title}
          />
          {/* 入力欄の見出しの高さだけ下げ、入力欄とボタンの縦の位置をそろえる */}
          <Button
            disabled={isTitleEmpty || creationMutation.isPending}
            leftSection={creationMutation.isPending ? <Loader size="xs" /> : null}
            mt="lg"
            type="submit"
          >
            {creationMutation.isPending ? '追加しています…' : 'Todo を追加'}
          </Button>
        </Group>
      </form>
      {creationMutation.data?.ok === false ? (
        <Alert
          color="red"
          icon={<IconAlertCircle aria-hidden size={alertIconSize} />}
          title="Todo を追加できませんでした"
          variant="light"
        >
          {creationMutation.data.error.message}
        </Alert>
      ) : null}
    </Stack>
  );
};
