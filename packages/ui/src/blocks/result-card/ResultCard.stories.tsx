import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Stack, Text } from '@mantine/core';
import { ResultCard } from '@template/ui/blocks/result-card/ResultCard';

const meta = {
  args: {
    children: (
      <Stack gap="xs">
        <Text size="md">ハンドクリーム 50ml</Text>
        <Text c="dimmed" size="xs">
          商品コードの末尾
        </Text>
        <Text ff="monospace" fw={600} fz={48} lh={1}>
          4417
        </Text>
      </Stack>
    ),
    status: { kind: 'pending', label: '確かめています…' },
  },
  component: ResultCard,
} satisfies Meta<typeof ResultCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  name: '読み込み中の場合',
};

export const StatusSuccess: Story = {
  args: { status: { kind: 'success', label: '合っています' } },
  name: 'statusがsuccessの場合',
};

export const Error: Story = {
  args: {
    status: {
      detail: '棚の番号は 4417、読んだ番号は 4471 です',
      kind: 'failure',
      label: '番号が違います',
    },
  },
  name: 'エラーの場合',
};

export const StatusOffline: Story = {
  args: {
    status: { detail: '記録はまだしていません', kind: 'offline', label: '通信が切れています' },
  },
  name: 'statusがofflineの場合',
};
