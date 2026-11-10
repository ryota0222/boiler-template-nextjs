import { renderWithUi } from '@template/ui/testing/TestRendering';
import { screen } from '@testing-library/react';
import { expect, it } from 'vitest';

import { MaintenanceNotice } from '@/shared-components/maintenance-notice/MaintenanceNotice';

it('再開の予定を渡した場合、その時刻を出すこと', () => {
  renderWithUi(<MaintenanceNotice applicationName="業務アプリ" untilLabel="11月10日 6:00" />);

  const actual = screen.getByText('11月10日 6:00ごろに再開する予定です。');

  expect(actual).toBeInTheDocument();
});

it('再開の予定がない場合、待つように伝えること', () => {
  renderWithUi(<MaintenanceNotice applicationName="業務アプリ" untilLabel={null} />);

  const actual = screen.getByText('再開まで、しばらくお待ちください。');

  expect(actual).toBeInTheDocument();
});
