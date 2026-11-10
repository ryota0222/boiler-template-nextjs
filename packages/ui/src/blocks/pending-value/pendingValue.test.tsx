import { PendingValue } from '@template/ui/blocks/pending-value/PendingValue';
import { renderWithUi } from '@template/ui/testing/TestRendering';
import { screen } from '@testing-library/react';
import { expect, it } from 'vitest';

it('値を待っている場合、待っていることを名前に持つ領域を描画すること', () => {
  renderWithUi(<PendingValue characters={6} label="置き場の番号を待っています" />);

  const actual = screen.getByRole('status', { name: '置き場の番号を待っています' });

  expect(actual).toHaveAttribute('aria-busy', 'true');
});

it('値を待っている場合、待っていることを文字としても領域の中に置くこと', () => {
  renderWithUi(<PendingValue characters={6} label="置き場の番号を待っています" />);

  const actual = screen.getByRole('status');

  expect(actual).toHaveTextContent('置き場の番号を待っています');
});
