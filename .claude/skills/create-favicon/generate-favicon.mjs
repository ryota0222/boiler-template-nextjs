// アプリのアイコン（favicon）を、頭文字かロゴの SVG と背景の色から作り、Next.js の決まった置き場所に書き出す。
// Next.js が同梱する sharp だけを使い、ほかの依存を足さない。ICO は PNG を中に入れる形で、この中で組み立てる。
//
// 使い方:
//   node .claude/skills/create-favicon/generate-favicon.mjs --letter 業 --background "#4938d1"
//   node .claude/skills/create-favicon/generate-favicon.mjs --logo path/to/logo.svg --background "#4938d1"
// 書き出すもの: src/app/icon.png（512px）、src/app/apple-icon.png（180px）、src/app/favicon.ico（16・32・48px）
// 見た目の確かめ用: tmp/favicon-preview/{16,32,48,180}.png
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';
import sharp from 'sharp';

const { values } = parseArgs({
  options: {
    background: { type: 'string' },
    foreground: { default: '#ffffff', type: 'string' },
    letter: { type: 'string' },
    logo: { type: 'string' },
    out: { default: 'src/app', type: 'string' },
  },
});

if (values.background === undefined || (values.letter === undefined && values.logo === undefined)) {
  console.error('--background と、--letter か --logo のどちらかを渡してください');
  process.exit(1);
}

const canvas = 512;
// 角の丸みはタブの中で四角と見分けられる程度にとどめる
const radius = 112;
const escapeXml = (text) =>
  text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

const buildMark = async () => {
  if (values.logo !== undefined) {
    const logo = await readFile(values.logo, 'utf8');
    const inner = Buffer.from(logo).toString('base64');
    // ロゴは 6 割の大きさで真ん中に置き、縁に余白を残す
    const size = canvas * 0.6;
    const offset = (canvas - size) / 2;
    return `<image href="data:image/svg+xml;base64,${inner}" x="${offset}" y="${offset}" width="${size}" height="${size}"/>`;
  }
  // 頭文字は 1 文字だけにし、16px でも読める太さにする
  const letter = escapeXml(Array.from(values.letter.trim())[0] ?? '');
  return `<text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-family="Hiragino Sans, Hiragino Kaku Gothic ProN, Noto Sans JP, Yu Gothic, sans-serif" font-size="300" font-weight="700" fill="${values.foreground}">${letter}</text>`;
};

const buildSvg = async ({ rounded }) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas}" height="${canvas}" viewBox="0 0 ${canvas} ${canvas}">` +
  `<rect width="${canvas}" height="${canvas}" rx="${rounded ? radius : 0}" fill="${values.background}"/>` +
  (await buildMark()) +
  '</svg>';

const render = async ({ rounded, size }) =>
  sharp(Buffer.from(await buildSvg({ rounded })))
    .resize(size, size)
    .png()
    .toBuffer();

// ICO の中に PNG をそのまま並べる（Windows Vista 以降と、すべての今のブラウザが読める形）
const buildIco = (images) => {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  const entries = [];
  let offset = 6 + images.length * 16;
  for (const { buffer, size } of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(buffer.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += buffer.length;
  }
  return Buffer.concat([header, ...entries, ...images.map(({ buffer }) => buffer)]);
};

const icoSizes = [16, 32, 48];
const icoImages = await Promise.all(
  icoSizes.map(async (size) => ({ buffer: await render({ rounded: true, size }), size }))
);
// iPhone のホーム画面は OS が角を丸めるため、apple-icon は四角のまま渡す
const appleIcon = await render({ rounded: false, size: 180 });
const icon = await render({ rounded: true, size: canvas });

await mkdir(values.out, { recursive: true });
await writeFile(path.join(values.out, 'favicon.ico'), buildIco(icoImages));
await writeFile(path.join(values.out, 'apple-icon.png'), appleIcon);
await writeFile(path.join(values.out, 'icon.png'), icon);

const previewDirectory = 'tmp/favicon-preview';
await mkdir(previewDirectory, { recursive: true });
await Promise.all([
  ...icoImages.map(({ buffer, size }) =>
    writeFile(path.join(previewDirectory, `${size}.png`), buffer)
  ),
  writeFile(path.join(previewDirectory, '180.png'), appleIcon),
]);

console.log(
  `書き出しました: ${values.out}/favicon.ico, ${values.out}/apple-icon.png, ${values.out}/icon.png`
);
console.log(`見た目の確かめ用: ${previewDirectory}/`);
