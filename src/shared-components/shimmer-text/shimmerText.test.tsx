import { renderWithUi } from '@template/ui/testing/TestRendering';
import { screen } from '@testing-library/react';
import { expect, it } from 'vitest';

import { ShimmerText } from '@/shared-components/shimmer-text/ShimmerText';

it('文字を渡した場合、その文字を出すこと', () => {
  renderWithUi(<ShimmerText size="sm">業務フローを作っています</ShimmerText>);

  const actual = screen.getByText('業務フローを作っています');

  expect(actual).toBeInTheDocument();
});
