import { renderWithUi } from '@template/ui/testing/TestRendering';
import { expect, it } from 'vitest';

import { ThinkingOrbIcon } from '@/shared-components/thinking-orb-icon/ThinkingOrbIcon';

it('描いた場合、オーブを読み上げの対象から外すこと', () => {
  const { container } = renderWithUi(<ThinkingOrbIcon size="inline" />);

  const actual = container.querySelector('canvas');

  expect(actual).toHaveAttribute('aria-hidden', 'true');
});
