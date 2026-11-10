import { Avatar } from '@mantine/core';
import { IconUser } from '@tabler/icons-react';
import { isDefined } from 'remeda';

const avatarSizes = { lg: 56, md: 38, sm: 26 } as const;
const placeholderIconRatio = 0.6;

// 同じ人がいつも同じ色になるよう、名前の文字から Mantine の色を 1 つ選ぶ。灰色は名前のない人の印と見分けるため外す
const avatarColors = [
  'blue',
  'cyan',
  'teal',
  'green',
  'lime',
  'yellow',
  'orange',
  'red',
  'pink',
  'grape',
  'violet',
  'indigo',
] as const;

const graphemeSegmenter = new Intl.Segmenter('ja', { granularity: 'grapheme' });

const listGraphemes = (text: string): readonly string[] =>
  Array.from(graphemeSegmenter.segment(text), ({ segment }) => segment);

const sumCodePoints = (codePoints: readonly number[]): number => {
  let total = 0;
  for (const codePoint of codePoints) {
    total += codePoint;
  }
  return total;
};

export const pickAvatarColor = (name: string): (typeof avatarColors)[number] => {
  const total = sumCodePoints(listGraphemes(name).map((grapheme) => grapheme.codePointAt(0) ?? 0));
  return avatarColors[total % avatarColors.length] ?? 'blue';
};

// 頭文字は名前の最初の 1 文字にする（山田 太郎 → 山）。Mantine の name は単語の頭を 2 つ取り、日本語の名前では「山太」になるため使わない
export const pickInitial = (name: string): string => listGraphemes(name.trim())[0] ?? '';

// 画像があれば画像、なければ名前の頭文字、名前もなければ人の形のアイコンを出す。
// 横に名前の文字を並べるときは isDecorative にして読み上げから外し、同じ名前を 2 回読ませない。
// 名前がないときは読み上げる名前がないため、人の形のアイコンも読み上げから外す
export const UserAvatar = ({
  isDecorative,
  name,
  size,
  src,
}: {
  readonly isDecorative: boolean;
  readonly name: null | string;
  readonly size: keyof typeof avatarSizes;
  readonly src: null | string;
}): React.JSX.Element => {
  const label = isDecorative ? undefined : (name ?? undefined);
  const isHidden = !isDefined(label);
  const initial = name === null ? '' : pickInitial(name);

  return (
    <Avatar
      alt={label}
      aria-hidden={isHidden || undefined}
      aria-label={src === null ? label : undefined}
      color={name === null ? 'gray' : `${pickAvatarColor(name)}.9`}
      radius="xl"
      role={src === null && !isHidden ? 'img' : undefined}
      size={avatarSizes[size]}
      src={src}
      variant="light"
    >
      {initial === '' ? (
        <IconUser aria-hidden size={Math.round(avatarSizes[size] * placeholderIconRatio)} />
      ) : (
        initial
      )}
    </Avatar>
  );
};
