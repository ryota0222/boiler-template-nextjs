import { ResultCard } from '@template/ui/blocks/result-card/ResultCard';
import { renderWithUi } from '@template/ui/testing/TestRendering';
import { screen } from '@testing-library/react';
import { expect, it } from 'vitest';

it('結果を待っている場合、帯を待っている状態にし、進行中の文言を出すこと', () => {
  renderWithUi(
    <ResultCard status={{ kind: 'pending', label: '確かめています…' }}>ハンドクリーム</ResultCard>
  );

  const actual = screen.getByRole('status');

  expect(actual).toHaveAttribute('aria-busy', 'true');
  expect(actual).toHaveTextContent('確かめています…');
});

it('成功した場合、帯に結果の文言を出し、待っている状態を解くこと', () => {
  renderWithUi(
    <ResultCard status={{ kind: 'success', label: '合っています' }}>ハンドクリーム</ResultCard>
  );

  const actual = screen.getByRole('status');

  expect(actual).toHaveAttribute('aria-busy', 'false');
  expect(actual).toHaveTextContent('合っています');
});

it('失敗に詳しい説明を渡した場合、理由と説明の両方を帯に出すこと', () => {
  renderWithUi(
    <ResultCard
      status={{
        detail: '棚の番号は 4417、読んだ番号は 4471 です',
        kind: 'failure',
        label: '番号が違います',
      }}
    >
      ハンドクリーム
    </ResultCard>
  );

  const actual = screen.getByRole('status');

  expect(actual).toHaveTextContent('番号が違います棚の番号は 4417、読んだ番号は 4471 です');
});

it('物の情報を渡した場合、帯とは別にその情報を出すこと', () => {
  renderWithUi(
    <ResultCard status={{ kind: 'pending', label: '確かめています…' }}>
      ハンドクリーム 50ml
    </ResultCard>
  );

  const actual = screen.getByText('ハンドクリーム 50ml');

  expect(actual).toBeInTheDocument();
});
