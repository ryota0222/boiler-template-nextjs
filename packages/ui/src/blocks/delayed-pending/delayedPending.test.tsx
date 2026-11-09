import { DelayedPending, pendingDelayMs } from '@template/ui/blocks/delayed-pending/DelayedPending';
import { renderWithUi } from '@template/ui/testing/TestRendering';
import { act, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

it('待ち始めてから決めた時間に届かない場合、中身を出さないこと', () => {
  renderWithUi(<DelayedPending>待ちの表示</DelayedPending>);

  act(() => {
    vi.advanceTimersByTime(pendingDelayMs - 1);
  });

  const actual = screen.queryByText('待ちの表示');
  expect(actual).not.toBeInTheDocument();
});

it('待ち始めてから決めた時間が過ぎた場合、中身を出すこと', () => {
  renderWithUi(<DelayedPending>待ちの表示</DelayedPending>);

  act(() => {
    vi.advanceTimersByTime(pendingDelayMs);
  });

  const actual = screen.getByText('待ちの表示');
  expect(actual).toBeInTheDocument();
});
