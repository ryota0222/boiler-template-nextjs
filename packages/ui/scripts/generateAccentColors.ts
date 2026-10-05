import { generateAccentColors } from '@template/ui/theme/generateAccentColors';

// process.argv の先頭 2 つは node の実行ファイルとスクリプトのパス
const argumentOffset = 2;

const printAccentColors = (color: string): void => {
  const accentColorsResult = generateAccentColors(color);
  if (!accentColorsResult.ok) {
    console.error(accentColorsResult.error.message);
    process.exitCode = 1;
    return;
  }

  console.log(JSON.stringify(accentColorsResult.value));
};

const color = process.argv[argumentOffset];
if (color === undefined) {
  console.error("色を #rrggbb の形で 1 つ渡してください（例: '#4938d1'）");
  process.exitCode = 1;
}

if (color !== undefined) {
  printAccentColors(color);
}
