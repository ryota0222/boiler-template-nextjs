import { ActivityTimeline } from '@template/ui/blocks/activity-timeline/ActivityTimeline';
import { renderWithUi } from '@template/ui/testing/TestRendering';
import { screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';

const now = new Date('2026-11-10T09:00:00+09:00');
const items = [
  {
    at: new Date('2026-11-10T08:57:00+09:00'),
    detail: null,
    id: '2',
    title: '山田 太郎が状態を確認済みにしました',
  },
  {
    at: new Date('2026-11-09T09:00:00+09:00'),
    detail: '取引先名を直しました',
    id: '1',
    title: '佐藤 花子が更新しました',
  },
] as const;

it('履歴を渡した場合、渡した順に一覧として並べること', () => {
  renderWithUi(<ActivityTimeline items={items} label="更新の履歴" now={now} />);

  const actual = within(screen.getByRole('list', { name: '更新の履歴' }))
    .getAllByRole('listitem')
    .map((item) => item.textContent);

  expect(actual[0]).toContain('山田 太郎が状態を確認済みにしました3 分前');
  expect(actual[1]).toContain('佐藤 花子が更新しました取引先名を直しました昨日');
});
