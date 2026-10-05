import { EmptyCollection } from '@template/ui/blocks/empty-collection/EmptyCollection';
import { renderWithUi } from '@template/ui/testing/TestRendering';
import { fireEvent, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

const renderEmptyCollection = (filtered: null | { readonly onClear: () => void }): void => {
  renderWithUi(
    <EmptyCollection
      empty={{
        action: <button type="button">最初の注文を登録</button>,
        description: '注文を登録すると、ここに一覧で表示されます',
        title: '注文はまだありません',
      }}
      filtered={
        filtered === null
          ? null
          : {
              clearLabel: '条件をすべて解除',
              description: '検索: 田中、状態: 未発送 に一致する注文はありません',
              onClear: filtered.onClear,
              title: '条件に一致する注文はありません',
            }
      }
    />
  );
};

it('filteredを渡した場合、条件に一致しないことを見出しにすること', () => {
  renderEmptyCollection({ onClear: vi.fn() });

  const actual = screen.getByRole('heading', { level: 2 });

  expect(actual).toHaveTextContent('条件に一致する注文はありません');
});

it('filteredを渡した場合、条件を解除すると onClear を呼ぶこと', () => {
  const onClear = vi.fn();
  renderEmptyCollection({ onClear });

  fireEvent.click(screen.getByRole('button', { name: '条件をすべて解除' }));

  expect(onClear).toHaveBeenCalledOnce();
});

it('filteredを渡した場合、最初の 1 件を作る操作を描画しないこと', () => {
  renderEmptyCollection({ onClear: vi.fn() });

  const actual = screen.queryByRole('button', { name: '最初の注文を登録' });

  expect(actual).not.toBeInTheDocument();
});

it('filteredがnullの場合、何がないかを見出しにすること', () => {
  renderEmptyCollection(null);

  const actual = screen.getByRole('heading', { level: 2 });

  expect(actual).toHaveTextContent('注文はまだありません');
});

it('filteredがnullの場合、最初の 1 件を作る操作を描画すること', () => {
  renderEmptyCollection(null);

  const actual = screen.getByRole('button', { name: '最初の注文を登録' });

  expect(actual).toBeInTheDocument();
});

it('filteredがnullの場合、条件を解除する操作を描画しないこと', () => {
  renderEmptyCollection(null);

  const actual = screen.queryByRole('button', { name: '条件をすべて解除' });

  expect(actual).not.toBeInTheDocument();
});
