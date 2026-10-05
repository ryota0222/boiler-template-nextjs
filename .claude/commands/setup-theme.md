---
description: デザインの初期設定（アクセント色 / 角の丸み / 配色 / 文言の話し方）を対話で決めて src/helpers/theme.ts に確定する
---

# デザイン初期設定

このテンプレートは初期設定が確定するまで、`src/helpers/theme.ts` を除く `src/` 配下の実装が `PreToolUse` フックでブロックされる。以下の手順で 4 項目を確定すること。

## 手順

1. `AskUserQuestion` で次の 4 問を提示する（印象で選べる文言のまま使う）
2. アクセント色の値（#rrggbb）から、10 段階の色と主色の段階を作る

   ```bash
   pnpm --filter @template/ui run generate-accent-colors '<#rrggbb>'
   ```

   出力の `accentColors` と `accentShade` をそのまま使う

3. `src/helpers/theme.ts` の `accentColors`・`accentShade`・`radius`・`appearance`・`voiceAndTone` を書き換え、`isConfigured: true` にする。`fontFamily` と `fontFamilyMonospace` はそのまま残す
4. `pnpm test` を実行し、Storybook の a11y の検査（色のコントラスト）が通ることを確かめる。落ちた場合は、落ちた色の組み合わせを報告し、別の色を選び直すか相談する
5. 確定した内容を日本語で要約して報告する

## 質問と対応値

### アクセント色（一番伝えたい印象は？）

選択肢は `packages/ui/src/theme/accentPresets.ts` の `accentPresets` と同じ 4 色である。

| 選択肢                 | 名前          | 値        |
| ---------------------- | ------------- | --------- |
| 信頼・誠実（王道の青） | `blue`        | `#228be6` |
| 知的・先進的（青紫）   | `blue-violet` | `#4938d1` |
| 安心・成長（緑系）     | `green`       | `#40c057` |
| 情熱・活力（赤系）     | `red`         | `#fa5252` |

### radius（インターフェースの丸みは？）

| 選択肢                         | 値   |
| ------------------------------ | ---- |
| 丸み控えめ（フォーマル・硬派） | `xs` |
| 標準的な丸み（無難）           | `md` |
| しっかり丸み（親しみやすい）   | `lg` |
| 大きな丸み（ポップ）           | `xl` |

### appearance（配色モードは？）

| 選択肢     | 値      |
| ---------- | ------- |
| ライトのみ | `light` |
| ダークのみ | `dark`  |

### voiceAndTone（文言の話し方は？）

| 選択肢             | 値         |
| ------------------ | ---------- |
| かしこまった       | `formal`   |
| スタンダード       | `standard` |
| やさしい・寄り添う | `friendly` |

## 注意

- 表以外の色を希望された場合は、その色の #rrggbb をそのままスクリプトに渡す
- `generate-accent-colors` が返す `accentShade` は、渡した色そのものの段階より暗い段階になることがある（白との対比が 3:1 に届く段階から選ばれる。表の `green` は 8 番目の段階になる）。どの段階でも届かない色はスクリプト自体が失敗するので、その場合は別の色を選び直す
- 赤系（`red`）を選んだ場合は、赤をエラーや危険な操作に使うため（`.claude/rules/design-layout.md` の色の意味）、アクセント色にすると意味がぶつかることを伝えたうえで使う
- 文字の色の上書き（`dimmed` など）はライトの配色で測った値であり、ダークを選んだ場合は、主な画面の Storybook の a11y の検査で対比を確かめる旨を報告に含める
- 配色の切り替え（ライトとダークの行き来）は `UiProvider` が配色を固定するため、この設定だけでは動かない。必要になったら別途対応する旨を報告に含める
- `voiceAndTone` は実行時には効かず、UI コピーの指針として記録するだけの値である（`.claude/rules/design-copy.md` の制約の上での性格づけ）
- `accentColors` を手で書かない。スクリプトが失敗した場合は、失敗したことを利用者に伝えて止まる
