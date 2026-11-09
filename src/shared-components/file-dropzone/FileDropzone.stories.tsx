import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { fn } from 'storybook/test';

import { FileDropzone } from '@/shared-components/file-dropzone/FileDropzone';

const meta = {
  args: {
    accept: ['application/pdf', 'image/png', 'image/jpeg'],
    error: null,
    labels: { description: 'PDF か画像、10MB まで', title: 'ここにファイルを置くか、押して選ぶ' },
    maxSizeMegabytes: 10,
    onDrop: fn(),
    onReject: fn(),
  },
  component: FileDropzone,
} satisfies Meta<typeof FileDropzone>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ideal: Story = {
  name: '理想状態の場合',
};

export const Error: Story = {
  args: { error: '10MB より大きいファイルは置けません' },
  name: 'エラーの場合',
};
