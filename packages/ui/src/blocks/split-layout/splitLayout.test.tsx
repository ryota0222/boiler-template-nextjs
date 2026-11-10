import { SplitLayout } from '@template/ui/blocks/split-layout/SplitLayout';
import { renderWithUi } from '@template/ui/testing/TestRendering';
import { screen } from '@testing-library/react';
import { expect, it } from 'vitest';

it('一覧と詳細を渡した場合、一覧を名前のある区画に置き、詳細を並べて出すこと', () => {
  renderWithUi(
    <SplitLayout detail={<p>山田商事の詳細</p>} list={<p>取引先の一覧</p>} listLabel="取引先" />
  );

  const actual = [
    screen.getByRole('region', { name: '取引先' }),
    screen.getByText('山田商事の詳細'),
  ];

  expect(actual[0]).toHaveTextContent('取引先の一覧');
  expect(actual[1]).toBeInTheDocument();
});
