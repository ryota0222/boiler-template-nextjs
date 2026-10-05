import { ErrorBanner } from '@template/ui/blocks/error-banner/ErrorBanner';
import { renderWithUi } from '@template/ui/testing/TestRendering';
import { fireEvent, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

const renderErrorBanner = (onRetry: () => void): void => {
  renderWithUi(
    <ErrorBanner
      description="通信が切れた可能性があります。接続を確かめてから、もう一度読み込んでください。"
      onRetry={onRetry}
      retryLabel="もう一度読み込む"
      title="注文の一覧を読み込めませんでした"
    />
  );
};

it('失敗を渡した場合、すぐに読み上げられる領域として描画すること', () => {
  renderErrorBanner(vi.fn());

  const actual = screen.getByRole('alert');

  expect(actual).toHaveTextContent('注文の一覧を読み込めませんでした');
});

it('失敗を渡した場合、原因と次の一歩を描画すること', () => {
  renderErrorBanner(vi.fn());

  const actual = screen.getByText(/接続を確かめてから/u);

  expect(actual).toBeInTheDocument();
});

it('再試行のボタンを押した場合、onRetry を呼ぶこと', () => {
  const onRetry = vi.fn();
  renderErrorBanner(onRetry);

  fireEvent.click(screen.getByRole('button', { name: 'もう一度読み込む' }));

  expect(onRetry).toHaveBeenCalledOnce();
});

it('閉じるボタンを描画しないこと', () => {
  renderErrorBanner(vi.fn());

  const actual = screen.getAllByRole('button');

  expect(actual).toHaveLength(1);
});
