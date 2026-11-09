import { ResultPending } from '@template/ui/blocks/result-pending/ResultPending';
import { renderWithUi } from '@template/ui/testing/TestRendering';
import { screen } from '@testing-library/react';
import { expect, it } from 'vitest';

it('待っている場合、待っていることを名前に持つ領域を描画すること', () => {
  renderWithUi(<ResultPending height={48} label="照合の結果を待っています" />);

  const actual = screen.getByRole('status', { name: '照合の結果を待っています' });

  expect(actual).toHaveAttribute('aria-busy', 'true');
});

it('待っている場合、待っていることを文字としても領域の中に置くこと', () => {
  renderWithUi(<ResultPending height={48} label="照合の結果を待っています" />);

  const actual = screen.getByRole('status');

  expect(actual).toHaveTextContent('照合の結果を待っています');
});
