import { renderWithUi } from '@template/ui/testing/TestRendering';
import { screen } from '@testing-library/react';
import { expect, it } from 'vitest';

import { ThinkingIndicator } from '@/shared-components/thinking-indicator/ThinkingIndicator';

it('labelを渡した場合、その文字を出すこと', () => {
  renderWithUi(<ThinkingIndicator label="回答を考えています…" />);

  const actual = screen.getByText('回答を考えています…');

  expect(actual).toBeInTheDocument();
});
