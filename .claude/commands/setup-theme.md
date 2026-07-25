---
description: デザインの初期設定（accentColor / radius / appearance / voice & tone）を対話で決めて src/helpers/theme.ts に確定する
---

# デザイン初期設定

このテンプレートは初期設定が確定するまで、`src/helpers/theme.ts` を除く `src/` 配下の実装が `PreToolUse` フックでブロックされる。以下の手順で4項目を確定すること。

## 手順

1. `AskUserQuestion` で次の4問を提示する（印象で選べる文言のまま使う）
2. 回答を下表の値へ対応づける
3. `src/helpers/theme.ts` を確定値 + `isConfigured: true` で上書きする
4. 確定した内容を日本語で要約して報告する

## 質問と対応値

### accentColor（一番伝えたい印象は？）

| 選択肢                 | 値     |
| ---------------------- | ------ |
| 信頼・誠実（王道の青） | blue   |
| 知的・先進的（青紫）   | iris   |
| 安心・成長（緑系）     | green  |
| 情熱・活力（赤系）     | tomato |

### radius（インターフェースの丸みは？）

| 選択肢                       | 値     |
| ---------------------------- | ------ |
| 丸みなし（フォーマル・硬派） | none   |
| 標準的な丸み（無難）         | medium |
| しっかり丸み（親しみやすい） | large  |
| 完全な丸み（ポップ）         | full   |

### appearance（配色モードは？）

| 選択肢     | 値      |
| ---------- | ------- |
| ライトのみ | light   |
| ダークのみ | dark    |
| 切り替え可 | inherit |

### voiceAndTone（文言の話し方は？）

| 選択肢             | 値       |
| ------------------ | -------- |
| かしこまった       | formal   |
| スタンダード       | standard |
| やさしい・寄り添う | friendly |

## 書き込む内容

`src/helpers/theme.ts` を次の形にする（値は回答で置換）:

```typescript
export const themeConfig = {
  accentColor: 'blue',
  appearance: 'light',
  isConfigured: true,
  radius: 'medium',
  voiceAndTone: 'standard',
} as const;
```

## 注意

- accentColor は Radix Themes の29色から選べる。ユーザーが表以外の色を希望した場合は accent color 名をそのまま使う
- `appearance: 'inherit'`（切り替え可）を選んだ場合、実際のライト/ダークのトグルは別途対応が必要（例: `next-themes` の導入）。この設定値だけでは自動切り替えは動かない旨を報告に含めること
- `voiceAndTone` は実行時には効かず、UI コピーの指針として記録するだけの値である（`.claude/rules/design-copy.md` の制約の上での性格づけ）
