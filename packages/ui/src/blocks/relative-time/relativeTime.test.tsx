import { formatRelativeTime } from '@template/ui/blocks/relative-time/RelativeTime';
import { expect, it } from 'vitest';

const now = new Date('2026-11-10T09:00:00+09:00');

it.each([
  { expected: '今', value: new Date('2026-11-10T08:59:30+09:00') },
  { expected: '3 分前', value: new Date('2026-11-10T08:57:00+09:00') },
  { expected: '2 時間前', value: new Date('2026-11-10T07:00:00+09:00') },
  { expected: '一昨日', value: new Date('2026-11-08T09:00:00+09:00') },
])('$value の場合、$expected と出すこと', ({ expected, value }) => {
  const actual = formatRelativeTime({ now, value });

  expect(actual).toBe(expected);
});

it('1 週間より前の場合、相対の言い方ではなく日付で出すこと', () => {
  const actual = formatRelativeTime({ now, value: new Date('2026-10-01T09:00:00+09:00') });

  expect(actual).toMatch(/^2026\/10\/01/u);
});
