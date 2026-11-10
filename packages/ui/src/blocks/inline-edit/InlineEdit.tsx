'use client';

import { Button, Group, Loader, Stack, Text, TextInput } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';

const loaderSize = 14;
const savedIconSize = 14;
const viewGap = 4;

export type InlineEditLabels = {
  readonly cancel: string;
  readonly edit: string;
  readonly save: string;
  readonly saved: string;
  readonly saving: string;
};

export type InlineEditSaveResult =
  { readonly message: string; readonly ok: false } | { readonly ok: true };

// 詳細の 1 つの値を、編集の画面へ移らずにその場で直す。保存の結果もその場で返し、通知は出さない（design-feedback.md）。
// DetailCard の項目のように見出しを外側が描くときは、hasViewingLabel を false にして見出しを 2 回並べない。
// 直している間の入力欄には、外側の見出しと関係なくいつもラベルを付ける
export const InlineEdit = ({
  hasViewingLabel,
  label,
  labels,
  onSave,
  value,
}: {
  readonly hasViewingLabel: boolean;
  readonly label: string;
  readonly labels: InlineEditLabels;
  readonly onSave: (value: string) => Promise<InlineEditSaveResult>;
  readonly value: string;
}): React.JSX.Element => {
  const [mode, setMode] = useState<'editing' | 'saving' | 'viewing'>('viewing');
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState<null | string>(null);
  const [isSaved, setIsSaved] = useState(false);
  const inputReference = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mode === 'editing') {
      inputReference.current?.focus();
    }
  }, [mode]);

  const startEditing = (): void => {
    setDraft(value);
    setError(null);
    setIsSaved(false);
    setMode('editing');
  };

  if (mode === 'viewing') {
    return (
      <Stack gap={4}>
        {hasViewingLabel ? (
          <Text c="dimmed" size="xs">
            {label}
          </Text>
        ) : null}
        {/* compact-sm のボタンは左右に 8px の余白を持つため、間を 4px にして見た目の間を 12px にそろえる */}
        <Group gap={viewGap} wrap="nowrap">
          <Text size="sm">{value}</Text>
          <Button onClick={startEditing} size="compact-sm" variant="subtle">
            {labels.edit}
          </Button>
          <Group gap={4} role="status" wrap="nowrap">
            {isSaved ? (
              <>
                <IconCheck aria-hidden color="var(--mantine-color-green-9)" size={savedIconSize} />
                <Text size="xs">{labels.saved}</Text>
              </>
            ) : null}
          </Group>
        </Group>
      </Stack>
    );
  }

  const isSaving = mode === 'saving';

  const cancel = (): void => {
    setError(null);
    setMode('viewing');
  };

  const save = async (): Promise<void> => {
    setMode('saving');
    const result = await onSave(draft);
    if (result.ok) {
      setIsSaved(true);
      setMode('viewing');
      return;
    }
    setError(result.message);
    setMode('editing');
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      <Stack gap="xs">
        <TextInput
          disabled={isSaving}
          error={error}
          label={label}
          onChange={(event) => {
            setDraft(event.currentTarget.value);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              cancel();
            }
          }}
          ref={inputReference}
          value={draft}
        />
        {/* 閉じる操作を左、実行を右に置く（design-feedback.md） */}
        <Group gap="xs">
          <Button disabled={isSaving} onClick={cancel} size="xs" variant="default">
            {labels.cancel}
          </Button>
          <Button
            disabled={isSaving}
            leftSection={isSaving ? <Loader color="gray" size={loaderSize} /> : null}
            size="xs"
            type="submit"
          >
            {isSaving ? labels.saving : labels.save}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
