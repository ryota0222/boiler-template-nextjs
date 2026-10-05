import { StatusBadge } from '@template/ui/blocks/status-badge/StatusBadge';
import { renderWithUi } from '@template/ui/testing/TestRendering';
import { screen } from '@testing-library/react';
import { expect, it } from 'vitest';

it('状態の文言を渡した場合、文言を描画すること', () => {
  renderWithUi(
    <StatusBadge size="md" tone="failed">
      失敗
    </StatusBadge>
  );

  const actual = screen.getByText('失敗');

  expect(actual).toBeInTheDocument();
});

it('状態を渡した場合、アイコンを読み上げの対象から外すこと', () => {
  const { container } = renderWithUi(
    <StatusBadge size="md" tone="done">
      確認済み
    </StatusBadge>
  );

  const actual = container.querySelector('svg');

  expect(actual).toHaveAttribute('aria-hidden', 'true');
});
