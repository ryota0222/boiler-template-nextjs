import { MetricValue } from '@template/ui/blocks/metric-value/MetricValue';
import { renderWithUi } from '@template/ui/testing/TestRendering';
import { screen } from '@testing-library/react';
import { expect, it } from 'vitest';

it('単位を渡した場合、数字と単位を別々の文字として出すこと', () => {
  renderWithUi(<MetricValue size="xl" unit="個" value="12" />);

  const actual = [screen.getByText('12'), screen.getByText('個')];

  expect(actual).toHaveLength(2);
});

it('単位がない場合、数字だけを出すこと', () => {
  const { container } = renderWithUi(<MetricValue size="xl" unit={null} value="4417" />);

  const actual = container.textContent;

  expect(actual).toBe('4417');
});
