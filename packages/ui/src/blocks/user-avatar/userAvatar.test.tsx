import {
  pickAvatarColor,
  pickInitial,
  UserAvatar,
} from '@template/ui/blocks/user-avatar/UserAvatar';
import { renderWithUi } from '@template/ui/testing/TestRendering';
import { screen } from '@testing-library/react';
import { expect, it } from 'vitest';

it('名前を渡した場合、最初の 1 文字を頭文字にすること', () => {
  const actual = pickInitial(' 山田 太郎');

  expect(actual).toBe('山');
});

it('同じ名前を渡した場合、いつも同じ色を選ぶこと', () => {
  const actual = [pickAvatarColor('山田 太郎'), pickAvatarColor('山田 太郎')];

  expect(actual[0]).toBe(actual[1]);
});

it('画像がない場合、名前を読み上げの名前にして頭文字を出すこと', () => {
  renderWithUi(<UserAvatar isDecorative={false} name="山田 太郎" size="md" src={null} />);

  const actual = screen.getByRole('img', { name: '山田 太郎' });

  expect(actual).toHaveTextContent('山');
});

it('飾りとして置く場合、読み上げから外すこと', () => {
  renderWithUi(<UserAvatar isDecorative name="山田 太郎" size="sm" src={null} />);

  const actual = screen.getByText('山').closest('.mantine-Avatar-root');

  expect(actual).toHaveAttribute('aria-hidden', 'true');
});
