import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { DateRangeFilter } from '@/shared-components/date-range-filter/DateRangeFilter';

const meta = {
  args: {
    labels: {
      calendar: {
        nextDecade: '次の10年',
        nextMonth: '次の月',
        nextYear: '次の年',
        previousDecade: '前の10年',
        previousMonth: '前の月',
        previousYear: '前の年',
      },
      clear: '期間を消す',
      input: '更新日',
      placeholder: '期間を選ぶ',
      presets: { last7Days: '直近7日', lastMonth: '先月', thisMonth: '今月' },
    },
    onChange: fn(),
    today: '2026-11-10',
    value: [null, null],
  },
  component: DateRangeFilter,
} satisfies Meta<typeof DateRangeFilter>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  name: '空の場合',
};

export const Ideal: Story = {
  args: { value: ['2026-11-01', '2026-11-10'] },
  name: '理想状態の場合',
};

export const Opened: Story = {
  name: '開いた場合',
  play: async ({ canvasElement }): Promise<void> => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: '更新日' }));
    const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog');
    await waitFor(async () => {
      await expect(getComputedStyle(dialog).opacity).toBe('1');
    });
  },
};
