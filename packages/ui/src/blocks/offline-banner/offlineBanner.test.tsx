import { OfflineBanner } from '@template/ui/blocks/offline-banner/OfflineBanner';
import { renderWithUi } from '@template/ui/testing/TestRendering';
import { act, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

const labels = { description: 'つながるまで記録はしません', title: '通信が切れています' } as const;

it('つながっている場合、何も出さないこと', () => {
  renderWithUi(<OfflineBanner labels={labels} />);

  const actual = screen.queryByRole('status');

  expect(actual).not.toBeInTheDocument();
});

it('通信が切れた場合、切れたことと記録したかどうかを出すこと', () => {
  renderWithUi(<OfflineBanner labels={labels} />);

  act(() => {
    globalThis.dispatchEvent(new Event('offline'));
  });

  const actual = screen.getByRole('status');
  expect(actual).toHaveTextContent('通信が切れていますつながるまで記録はしません');
});
