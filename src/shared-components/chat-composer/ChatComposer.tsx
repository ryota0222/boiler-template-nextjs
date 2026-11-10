'use client';

import { ActionIcon, Group, Textarea } from '@mantine/core';
import { IconArrowUp } from '@tabler/icons-react';
import { useState } from 'react';

const sendIconSize = 18;
const maxRows = 6;

export type ChatComposerLabels = {
  readonly input: string;
  readonly placeholder: string;
  readonly send: string;
  readonly sending: string;
};

// 送信のボタンは上向きの矢印だけにし、文字を打っている間は filled にする（design-icon.md、design-hierarchy.md）。
// Enter で送り、Shift+Enter で改行する。漢字の変換を確定する Enter では送らない
export const ChatComposer = ({
  isSending,
  labels,
  onSend,
}: {
  readonly isSending: boolean;
  readonly labels: ChatComposerLabels;
  readonly onSend: (message: string) => void;
}): React.JSX.Element => {
  const [message, setMessage] = useState('');
  const trimmed = message.trim();
  const canSend = trimmed !== '' && !isSending;

  const send = (): void => {
    if (!canSend) {
      return;
    }
    onSend(trimmed);
    setMessage('');
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        send();
      }}
    >
      <Group align="flex-end" gap="xs" wrap="nowrap">
        <Textarea
          aria-label={labels.input}
          autosize
          maxRows={maxRows}
          minRows={1}
          onChange={(event) => {
            setMessage(event.currentTarget.value);
          }}
          onKeyDown={(event) => {
            if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) {
              return;
            }

            event.preventDefault();
            send();
          }}
          placeholder={labels.placeholder}
          style={{ flex: 1 }}
          value={message}
        />
        <ActionIcon
          aria-label={isSending ? labels.sending : labels.send}
          disabled={!canSend}
          loading={isSending}
          size="lg"
          type="submit"
          variant={trimmed === '' ? 'default' : 'filled'}
        >
          <IconArrowUp aria-hidden size={sendIconSize} />
        </ActionIcon>
      </Group>
    </form>
  );
};
