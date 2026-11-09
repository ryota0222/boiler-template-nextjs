import { SegmentedProgress } from '@template/ui/blocks/segmented-progress/SegmentedProgress';
import { renderWithUi } from '@template/ui/testing/TestRendering';
import { screen } from '@testing-library/react';
import { expect, it } from 'vitest';

it('全体が 8 個以下の場合、区切りの数と済んだ数を進み具合として持つこと', () => {
  renderWithUi(<SegmentedProgress done={3} label="梱包済み" total={5} />);

  const actual = screen.getByRole('progressbar', { name: '梱包済み' });

  expect(actual).toHaveAttribute('aria-valuenow', '3');
  expect(actual).toHaveAttribute('aria-valuemax', '5');
});

it('全体が 8 個より多い場合、1 本の棒で済んだ割合を進み具合として持つこと', () => {
  renderWithUi(<SegmentedProgress done={6} label="梱包済み" total={18} />);

  const actual = screen.getByRole('progressbar', { name: '梱包済み' });

  expect(actual).toHaveAttribute('aria-valuenow', '33');
});

it('全体が 1 個の場合、進み具合を出さないこと', () => {
  const { container } = renderWithUi(<SegmentedProgress done={0} label="梱包済み" total={1} />);

  const actual = container.textContent;

  expect(actual).toBe('');
});

it('進み具合を出す場合、済んだ数と全体の数を文字でも出すこと', () => {
  renderWithUi(<SegmentedProgress done={6} label="梱包済み" total={18} />);

  const actual = screen.getByText(/梱包済み/u);

  expect(actual).toHaveTextContent('梱包済み 6 / 18');
});
