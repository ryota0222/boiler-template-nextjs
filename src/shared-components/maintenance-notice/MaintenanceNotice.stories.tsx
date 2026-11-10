import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { MaintenanceNotice } from '@/shared-components/maintenance-notice/MaintenanceNotice';

const meta = {
  args: {
    applicationName: '業務アプリ',
    untilLabel: '11月10日 6:00',
  },
  component: MaintenanceNotice,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof MaintenanceNotice>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ideal: Story = {
  name: '理想状態の場合',
};

export const WithoutUntil: Story = {
  args: { untilLabel: null },
  name: 'untilLabelがnullの場合',
};
