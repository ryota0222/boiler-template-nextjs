'use client';

import type { DatePickerPreset } from '@mantine/dates';

import 'dayjs/locale/ja';
import { DatePickerInput, DatesProvider } from '@mantine/dates';
import { IconCalendar } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useId } from 'react';

const dateFormat = 'YYYY-MM-DD';
const daysInLastWeek = 6;
const iconSize = 16;
const sunday = 0;
const saturday = 6;

export type DateRange = readonly [null | string, null | string];

export type DateRangeFilterLabels = {
  readonly calendar: {
    readonly nextDecade: string;
    readonly nextMonth: string;
    readonly nextYear: string;
    readonly previousDecade: string;
    readonly previousMonth: string;
    readonly previousYear: string;
  };
  readonly clear: string;
  readonly input: string;
  readonly placeholder: string;
  readonly presets: {
    readonly last7Days: string;
    readonly lastMonth: string;
    readonly thisMonth: string;
  };
};

// 一覧の期間の絞り込みでよく選ぶ範囲を、カレンダーで日を 2 回押さずに選べるようにする。
// 今日は呼ぶ側から受け取り、サーバーとブラウザで同じ範囲を出す
export const buildDateRangePresets = ({
  labels,
  today,
}: {
  readonly labels: DateRangeFilterLabels['presets'];
  readonly today: string;
}): DatePickerPreset<'range'>[] => {
  const day = dayjs(today);
  const lastMonth = day.subtract(1, 'month');
  return [
    {
      label: labels.last7Days,
      value: [day.subtract(daysInLastWeek, 'day').format(dateFormat), today],
    },
    { label: labels.thisMonth, value: [day.startOf('month').format(dateFormat), today] },
    {
      label: labels.lastMonth,
      value: [
        lastMonth.startOf('month').format(dateFormat),
        lastMonth.endOf('month').format(dateFormat),
      ],
    },
  ];
};

// 期間で一覧を絞り込む入力欄。日付は日本の並び（年/月/日、週は日曜から）で出す
export const DateRangeFilter = ({
  labels,
  onChange,
  today,
  value,
}: {
  readonly labels: DateRangeFilterLabels;
  readonly onChange: (value: DateRange) => void;
  readonly today: string;
  readonly value: DateRange;
}): React.JSX.Element => {
  const inputID = useId();

  return (
    <DatesProvider
      settings={{ firstDayOfWeek: sunday, locale: 'ja', weekendDays: [sunday, saturday] }}
    >
      <DatePickerInput
        ariaLabels={labels.calendar}
        clearable
        clearButtonProps={{ 'aria-label': labels.clear }}
        id={inputID}
        label={labels.input}
        leftSection={<IconCalendar aria-hidden size={iconSize} />}
        onChange={(range) => {
          onChange(range);
        }}
        placeholder={labels.placeholder}
        // DatePickerInput は入力欄の id をボタンに付けるため、Popover にも同じ id を渡し、開いたカレンダーの名前をボタンのラベルから取らせる
        popoverProps={{ id: inputID }}
        presets={buildDateRangePresets({ labels: labels.presets, today })}
        type="range"
        value={[...value]}
        valueFormat="YYYY/MM/DD"
      />
    </DatesProvider>
  );
};
