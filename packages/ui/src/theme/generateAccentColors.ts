import { generateColorsMap } from '@mantine/colors-generator';
import chroma from 'chroma-js';

// packages/ui はアプリ側の型に依存できないため、アプリの Result を使わずに同じ形を置く
type Result<T> =
  { readonly error: Error; readonly ok: false } | { readonly ok: true; readonly value: T };

const toAccentColors = (
  color: string
): Result<{
  readonly baseShade: number;
  readonly colors: readonly string[];
}> => {
  // chroma-js は解釈できない色を渡すと例外を投げるため、ここで Result に変える
  try {
    const { baseColorIndex, colors } = generateColorsMap(color);
    return {
      ok: true,
      value: {
        baseShade: baseColorIndex,
        colors: colors.map((shade) => shade.hex()),
      },
    };
  } catch (error) {
    return {
      error: new Error(`色として解釈できません: ${color}（${String(error)}）`),
      ok: false,
    };
  }
};

// 主色は白の背景の上の文字（リンクなど）と、白い文字を載せる背景（ボタンなど）の両方に使うため、白との間で対比を満たす必要がある。
// 基準は WCAG AA の大きな文字と UI 部品の 3:1 にそろえ、Storybook と e2e の axe の検査の color-contrast も同じ 3:1 で測る
const minimumContrastRatioWithWhite = 3;
const white = '#ffffff';

// 渡された色の段階が白との対比に届かないときは、色相を保ったまま届く段階まで暗くする。
// 最も暗い段階は選ばない。Mantine の filled のボタンはホバーで主色の 1 つ暗い段階を使うため、
// 主色が最も暗い段階だとホバーの色が 1 つ明るい段階に戻り、対比が 3:1 を割るうえ、本文の文字とも見分けにくくなる
const findReadableShade = ({
  baseShade,
  colors,
}: {
  readonly baseShade: number;
  readonly colors: readonly string[];
}): number | undefined =>
  [...colors.entries()]
    .slice(baseShade, colors.length - 1)
    .find(([, shade]) => chroma.contrast(shade, white) >= minimumContrastRatioWithWhite)?.[0];

const lightestShade = 0;

export const generateAccentColors = (
  color: string
): Result<{
  readonly accentColors: readonly string[];
  readonly accentShade: number;
}> => {
  const accentColorsResult = toAccentColors(color);
  if (!accentColorsResult.ok) {
    return accentColorsResult;
  }

  const { baseShade, colors } = accentColorsResult.value;
  if (baseShade === lightestShade) {
    return {
      error: new Error(`${color} は明るすぎるため、白い背景の上で主色として見分けられません`),
      ok: false,
    };
  }

  if (baseShade === colors.length - 1) {
    return {
      error: new Error(`${color} は暗すぎるため、本文の文字と主色を見分けられません`),
      ok: false,
    };
  }

  const accentShade = findReadableShade({ baseShade, colors });
  if (accentShade === undefined) {
    return {
      error: new Error(
        `${color} は最も暗い段階の 1 つ手前でも白との対比が 3:1 に届かないため、文字やボタンの色に使えません`
      ),
      ok: false,
    };
  }

  return { ok: true, value: { accentColors: colors, accentShade } };
};
