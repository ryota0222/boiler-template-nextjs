'use client';

import { Text, Tooltip } from '@mantine/core';

const millisecondsPerSecond = 1000;
const secondsPerMinute = 60;
const secondsPerHour = 3600;
const secondsPerDay = 86_400;
const daysPerWeek = 7;

const relativeFormatter = new Intl.RelativeTimeFormat('ja', { numeric: 'auto' });
const absoluteFormatter = new Intl.DateTimeFormat('ja-JP', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

// 1 週間以内は「3 分前」のような相対の言い方にし、それより前は相対だと計算させてしまうため日付で出す
export const formatRelativeTime = ({
  now,
  value,
}: {
  readonly now: Date;
  readonly value: Date;
}): string => {
  const seconds = Math.round((value.getTime() - now.getTime()) / millisecondsPerSecond);
  const absoluteSeconds = Math.abs(seconds);
  if (absoluteSeconds < secondsPerMinute) {
    return relativeFormatter.format(0, 'second');
  }
  if (absoluteSeconds < secondsPerHour) {
    return relativeFormatter.format(Math.round(seconds / secondsPerMinute), 'minute');
  }
  if (absoluteSeconds < secondsPerDay) {
    return relativeFormatter.format(Math.round(seconds / secondsPerHour), 'hour');
  }
  if (absoluteSeconds < secondsPerDay * daysPerWeek) {
    return relativeFormatter.format(Math.round(seconds / secondsPerDay), 'day');
  }
  return absoluteFormatter.format(value);
};

// 現在の時刻は呼ぶ側から受け取り、サーバーとブラウザで描く内容をそろえる。正確な日時はマウスを載せるかフォーカスすると出す
export const RelativeTime = ({
  now,
  value,
}: {
  readonly now: Date;
  readonly value: Date;
}): React.JSX.Element => (
  <Tooltip
    events={{ focus: true, hover: true, touch: true }}
    label={absoluteFormatter.format(value)}
  >
    <Text component="time" dateTime={value.toISOString()} size="sm" tabIndex={0}>
      {formatRelativeTime({ now, value })}
    </Text>
  </Tooltip>
);
