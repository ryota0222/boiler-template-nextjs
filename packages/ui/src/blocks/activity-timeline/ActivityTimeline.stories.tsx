import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ActivityTimeline } from '@template/ui/blocks/activity-timeline/ActivityTimeline';

const meta = {
  args: {
    items: [
      {
        at: new Date('2026-11-10T08:57:00+09:00'),
        detail: null,
        id: '3',
        title: '山田 太郎が状態を確認済みにしました',
      },
      {
        at: new Date('2026-11-09T09:00:00+09:00'),
        detail: '取引先名を直しました',
        id: '2',
        title: '佐藤 花子が更新しました',
      },
      {
        at: new Date('2026-10-01T09:00:00+09:00'),
        detail: null,
        id: '1',
        title: '山田 太郎が登録しました',
      },
    ],
    label: '更新の履歴',
    now: new Date('2026-11-10T09:00:00+09:00'),
  },
  component: ActivityTimeline,
} satisfies Meta<typeof ActivityTimeline>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ideal: Story = {
  name: '理想状態の場合',
};
