import { accentPresets } from '@template/ui/theme/accentPresets';
import { generateAccentColors } from '@template/ui/theme/generateAccentColors';
import { expect, it } from 'vitest';

it('中間の明るさの色を渡した場合、その色を主色の段階に置くこと', () => {
  const actual = generateAccentColors('#4938d1');

  expect(actual).toStrictEqual({
    ok: true,
    value: {
      accentColors: [
        '#f0edff',
        '#dcd8fa',
        '#b5aeee',
        '#8c81e2',
        '#6a5cd8',
        '#5444d3',
        '#4938d1',
        '#3a2ab9',
        '#3225a7',
        '#281f94',
      ],
      accentShade: 6,
    },
  });
});

it('渡した色の段階が白との対比 3:1 に届かない場合、届く段階まで暗くした段階を主色の段階にすること', () => {
  const actual = generateAccentColors('#40c057');

  expect(actual).toStrictEqual({
    ok: true,
    value: {
      accentColors: [
        '#e9fcec',
        '#d8f4dd',
        '#b3e7bc',
        '#8bd999',
        '#69cd7b',
        '#53c567',
        '#40c057',
        '#36ab4c',
        '#2c9842',
        '#1c8435',
      ],
      accentShade: 8,
    },
  });
});

it('最も暗い段階だけが白との対比 3:1 に届く色を渡した場合、最も暗い段階を選ばずに使えない理由を返すこと', () => {
  const actual = generateAccentColors('#fab005');

  expect(actual).toStrictEqual({
    error: new Error(
      '#fab005 は最も暗い段階の 1 つ手前でも白との対比が 3:1 に届かないため、文字やボタンの色に使えません'
    ),
    ok: false,
  });
});

// 業務アプリの生成コマンドは名前で選んだ色をそのまま渡し、使えない色を受け取る経路を持たないため
it.each(Object.entries(accentPresets).map(([name, color]) => ({ color, name })))(
  'アクセント色の選択肢 $name（$color）を渡した場合、主色の段階を返すこと',
  ({ color }) => {
    const actual = generateAccentColors(color).ok;

    const expected = true;
    expect(actual).toBe(expected);
  }
);

it('ほぼ白の色を渡した場合、明るすぎて主色に使えない理由を返すこと', () => {
  const actual = generateAccentColors('#ffffff');

  expect(actual).toStrictEqual({
    error: new Error('#ffffff は明るすぎるため、白い背景の上で主色として見分けられません'),
    ok: false,
  });
});

it('ほぼ黒の色を渡した場合、暗すぎて主色に使えない理由を返すこと', () => {
  const actual = generateAccentColors('#000000');

  expect(actual).toStrictEqual({
    error: new Error('#000000 は暗すぎるため、本文の文字と主色を見分けられません'),
    ok: false,
  });
});

it('色として解釈できない文字列を渡した場合、解釈できない理由を返すこと', () => {
  const actual = generateAccentColors('not-a-color');

  expect(actual).toStrictEqual({
    error: new Error('色として解釈できません: not-a-color（Error: unknown format: not-a-color）'),
    ok: false,
  });
});
