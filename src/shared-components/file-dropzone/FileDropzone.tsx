'use client';

import type { FileWithPath } from '@mantine/dropzone';

import { Group, Stack, Text } from '@mantine/core';
import { Dropzone, DropzoneAccept, DropzoneIdle, DropzoneReject } from '@mantine/dropzone';
import { IconPaperclip, IconX } from '@tabler/icons-react';

const iconSize = 32;
const bytesPerKilobyte = 1024;
const bytesPerMegabyte = bytesPerKilobyte * bytesPerKilobyte;

export type FileDropzoneLabels = {
  // 受け付けるファイルの種類と大きさを、置く前に読めるように書く（例：PDF か画像、10MB まで）
  readonly description: string;
  readonly title: string;
};

// ファイルを置く場所。受け付けない種類や大きすぎるファイルの理由は呼ぶ側が決め、error で枠の下に出す（design-form.md）
export const FileDropzone = ({
  accept,
  error,
  labels,
  maxSizeMegabytes,
  onDrop,
  onReject,
}: {
  readonly accept: readonly string[];
  readonly error: null | string;
  readonly labels: FileDropzoneLabels;
  readonly maxSizeMegabytes: number;
  readonly onDrop: (files: readonly FileWithPath[]) => void;
  readonly onReject: () => void;
}): React.JSX.Element => (
  <Stack gap={4}>
    <Dropzone
      accept={[...accept]}
      maxSize={maxSizeMegabytes * bytesPerMegabyte}
      onDrop={(files) => {
        onDrop(files);
      }}
      onReject={() => {
        onReject();
      }}
    >
      <Group gap="md" justify="center" mih={120} wrap="nowrap">
        <DropzoneAccept>
          <IconPaperclip aria-hidden color="var(--mantine-primary-color-filled)" size={iconSize} />
        </DropzoneAccept>
        <DropzoneReject>
          <IconX aria-hidden color="var(--mantine-color-error)" size={iconSize} />
        </DropzoneReject>
        <DropzoneIdle>
          <IconPaperclip aria-hidden color="var(--mantine-color-dimmed)" size={iconSize} />
        </DropzoneIdle>
        <Stack gap={4}>
          <Text fw={700} size="sm">
            {labels.title}
          </Text>
          <Text c="dimmed" size="xs">
            {labels.description}
          </Text>
        </Stack>
      </Group>
    </Dropzone>
    {error === null ? null : (
      <Text c="var(--mantine-color-error)" role="alert" size="xs">
        {error}
      </Text>
    )}
  </Stack>
);
