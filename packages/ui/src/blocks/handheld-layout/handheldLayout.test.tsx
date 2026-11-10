import { HandheldLayout } from '@template/ui/blocks/handheld-layout/HandheldLayout';
import { renderWithUi } from '@template/ui/testing/TestRendering';
import { screen } from '@testing-library/react';
import { expect, it } from 'vitest';

it('作業の名前を渡した場合、画面の見出しにすること', () => {
  renderWithUi(
    <HandheldLayout
      footer={<button type="button">次の箱へ</button>}
      menu={null}
      offlineLabels={{ description: 'つながるまで記録はしません', title: '通信が切れています' }}
      progress={null}
      title="パック · 持ち場 B-3"
    >
      <p>作業の中身</p>
    </HandheldLayout>
  );

  const actual = screen.getByRole('heading', { level: 1 });

  expect(actual).toHaveTextContent('パック · 持ち場 B-3');
});
