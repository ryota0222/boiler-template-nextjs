import { CollectionSkeleton } from '@template/ui/blocks/collection-skeleton/CollectionSkeleton';
import { renderWithUi } from '@template/ui/testing/TestRendering';
import { screen } from '@testing-library/react';
import { expect, it } from 'vitest';

it('読み込み中の場合、読み込み中であることを名前に持つ領域を描画すること', () => {
  renderWithUi(<CollectionSkeleton loadingLabel="注文の一覧を読み込み中" rowCount={3} />);

  const actual = screen.getByRole('status', { name: '注文の一覧を読み込み中' });

  expect(actual).toHaveAttribute('aria-busy', 'true');
});

it('読み込み中の場合、読み込み中であることを文字としても領域の中に置くこと', () => {
  renderWithUi(<CollectionSkeleton loadingLabel="注文の一覧を読み込み中" rowCount={3} />);

  const actual = screen.getByRole('status');

  expect(actual).toHaveTextContent('注文の一覧を読み込み中');
});
