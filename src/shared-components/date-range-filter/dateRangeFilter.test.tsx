import { renderWithUi } from '@template/ui/testing/TestRendering';
import { screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

import {
  buildDateRangePresets,
  DateRangeFilter,
} from '@/shared-components/date-range-filter/DateRangeFilter';

const labels = {
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
} as const;

it('今日を渡した場合、直近7日・今月・先月の範囲を作ること', () => {
  const actual = buildDateRangePresets({ labels: labels.presets, today: '2026-11-10' }).map(
    (preset) => preset.value
  );

  expect(actual).toStrictEqual([
    ['2026-11-04', '2026-11-10'],
    ['2026-11-01', '2026-11-10'],
    ['2026-10-01', '2026-10-31'],
  ]);
});

it('範囲を渡した場合、年/月/日の形で入力欄に出すこと', () => {
  renderWithUi(
    <DateRangeFilter
      labels={labels}
      onChange={vi.fn()}
      today="2026-11-10"
      value={['2026-11-01', '2026-11-10']}
    />
  );

  const actual = screen.getByRole('button', { name: '更新日' });

  expect(actual).toHaveTextContent('2026/11/01 – 2026/11/10');
});
