import { DetailCard } from '@template/ui/blocks/detail-card/DetailCard';
import { renderWithUi } from '@template/ui/testing/TestRendering';
import { screen } from '@testing-library/react';
import { expect, it } from 'vitest';

const renderDetailCard = (): void => {
  renderWithUi(
    <DetailCard
      action={<button type="button">配送先を編集</button>}
      items={[
        { label: '住所', value: '東京都渋谷区' },
        { label: '電話番号', value: '03-0000-0000' },
      ]}
      title="配送先"
    />
  );
};

it('見出しを渡した場合、カードの見出しとして描画すること', () => {
  renderDetailCard();

  const actual = screen.getByRole('heading', { level: 2 });

  expect(actual).toHaveTextContent('配送先');
});

it('項目を渡した場合、項目名を用語として描画すること', () => {
  renderDetailCard();

  const actual = screen.getAllByRole('term').map((term) => term.textContent);

  expect(actual).toStrictEqual(['住所', '電話番号']);
});

it('項目を渡した場合、値を項目名の説明として描画すること', () => {
  renderDetailCard();

  const actual = screen.getByText('東京都渋谷区');

  expect(actual).toHaveRole('definition');
});

it('操作を渡した場合、操作を描画すること', () => {
  renderDetailCard();

  const actual = screen.getByRole('button', { name: '配送先を編集' });

  expect(actual).toBeInTheDocument();
});
