import { StatsGrid } from '@template/ui/blocks/stats-grid/StatsGrid';
import { renderWithUi } from '@template/ui/testing/TestRendering';
import { screen } from '@testing-library/react';
import { expect, it } from 'vitest';

const renderStatsGrid = (): void => {
  renderWithUi(
    <StatsGrid
      stats={[
        { label: '今月の受注額', note: '前月より 12% 増', value: '¥1,234,000' },
        { label: '未発送', note: '3 日以上経過 2 件', value: '8 件' },
      ]}
    />
  );
};

it('統計を渡した場合、項目名を用語として描画すること', () => {
  renderStatsGrid();

  const actual = screen.getAllByRole('term').map((term) => term.textContent);

  expect(actual).toStrictEqual(['今月の受注額', '未発送']);
});

it('統計を渡した場合、値を項目名の説明として描画すること', () => {
  renderStatsGrid();

  const actual = screen.getByText('¥1,234,000');

  expect(actual).toHaveRole('definition');
});

it('統計を渡した場合、補足を描画すること', () => {
  renderStatsGrid();

  const actual = screen.getByText('3 日以上経過 2 件');

  expect(actual).toBeInTheDocument();
});
