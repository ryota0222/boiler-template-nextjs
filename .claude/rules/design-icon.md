---
description: Rules for which icon set to use, which operations carry an icon, and which glyph each operation gets
paths:
  [
    'src/app/**/*.tsx',
    'src/features/**/*.tsx',
    'src/shared-components/**/*.tsx',
    'packages/ui/src/blocks/**/*.tsx',
  ]
---

# Icon Rules

`design-layout.md` decides the spacing, type, and colour values. This file decides the icon set, which controls carry an icon, and which glyph each operation gets. Navigation icons are chosen by `design-ooui.md`; the accessible name of an icon-only control is `design-affordance.md`; the icon on an alert or a state is `design-a11y.md`.

## One Icon Set

- **Type**: MUST
- **Reason**: Two sets differ in stroke weight and corner radius, and the difference reads as an error rather than as variety.

### Details

`@tabler/icons-react` is the set, because Mantine ships no icons and Mantine UI's blocks are written against Tabler. Keep Tabler's default stroke; never pass `stroke`. The same meaning always gets the same glyph, and no glyph is reused for two meanings.

| Where                                                                          | `size` |
| ------------------------------------------------------------------------------ | ------ |
| `leftSection` / `rightSection` of a `size="compact-sm"` control                | 14     |
| `leftSection` / `rightSection` of `sm` and `md` controls, `Menu.Item`, `Alert` | 16     |
| Inside an `ActionIcon size="lg"`                                               | 18     |
| `leftSection` of a `Badge`                                                     | 12     |

An icon never appears without either a text label next to it or an `aria-label` on the control (`design-a11y.md`). An icon next to a text label is decorative and takes `aria-hidden`.

## An Operation in the Table Carries Its Glyph

- **Type**: MUST
- **Reason**: These operations recur on many screens. A reader who has learnt the shape finds the control before reading its label, and that only works while every screen draws the same operation with the same shape.

### Details

The operation decides the icon, not the label's wording and not the button's variant: a filled `新しくつくる` carries `IconPlus` as much as a subtle one does.

| Operation                                     | Labels it appears as                                           | Glyph                              | Side      |
| --------------------------------------------- | -------------------------------------------------------------- | ---------------------------------- | --------- |
| Create or add                                 | `新しくつくる`, `〜を追加`                                     | `IconPlus`                         | Left      |
| Retry or load again                           | `もう一度〜`, `作り直す`, `再読み込み`, `最新の状態を読み込む` | `IconRefresh`                      | Left      |
| Go back to a previous screen or step          | `〜に戻る`, `〜へ戻る`, `アプリ一覧へ`                         | `IconArrowLeft`                    | Left      |
| Open in a new tab (`target="_blank"`)         | `〜を開く`, `別画面で開く`                                     | `IconExternalLink`                 | Right     |
| Delete                                        | `削除`, `削除する`                                             | `IconTrash`                        | Left      |
| Show full screen / leave full screen          | `拡大` / `元の表示`                                            | `IconMaximize` / `IconMinimize`    | Left      |
| Show or hide a side panel                     | `画面一覧`                                                     | `IconLayoutSidebar`                | Left      |
| Zoom in / zoom out                            | `〜を拡大する`, `〜を縮小する`                                 | `IconZoomIn` / `IconZoomOut`       | Icon only |
| Export a file                                 | `CSVを書き出す`                                                | `IconDownload`                     | Left      |
| Filter                                        | `絞り込み`                                                     | `IconFilter`                       | Left      |
| Attach a file / dictate                       | `資料を添付` / `音声入力`                                      | `IconPaperclip` / `IconMicrophone` | Left      |
| Send a chat message                           | `送信`                                                         | `IconArrowUp`                      | Icon only |
| Mark the start of an assistant's chat message | —                                                              | `IconSparkles`                     | Left      |
| Log out                                       | `ログアウト`                                                   | `IconLogout`                       | Left      |

`〜を開く` that stays in the same tab is navigation, not "open in a new tab", and carries no icon.

An operation not in the table carries no icon. Commit actions — `登録する`, `保存する`, `承認して機能開発へ` — say what they do in words, and an icon would only repeat them. When an operation without a row recurs on a second screen, add its row here before giving it a glyph.

## The Send Button in a Chat Composer Is Icon-Only

- **Type**: MUST
- **Reason**: An upward arrow at the end of a message box reads as "send" in every chat product the users already know, and the box keeps the width a text button would take.

### Details

```typescript
// Good
<ActionIcon
  aria-label={isSending ? "送信しています…" : "送信"}
  disabled={!canSend}
  loading={isSending}
  size="lg"
  type="submit"
>
  <IconArrowUp aria-hidden size={18} />
</ActionIcon>

// Bad: a text button beside the message box
<Button type="submit">送信</Button>
```

A form whose footer submits is not a chat composer; its submit keeps a text label (`design-hierarchy.md`).

## A State Badge Shows Its State with a Filled Glyph

- **Type**: MUST
- **Reason**: A coloured dot tells states apart by colour alone, which fails readers who cannot tell the colours apart (WCAG 1.4.1) and anyone glancing at a long list. A filled glyph adds a shape per state, and the fill keeps the glyph distinct from the outlined icons on operations.

### Details

A badge that shows a state is `StatusBadge` from `@template/ui/blocks/status-badge/StatusBadge`, never `Badge variant="dot"`. Pick the `tone` from what the state means for the reader, not from its wording; `StatusBadge` fixes the glyph and the colour for each tone, and colours the glyph only, so the label keeps the default text colour (`design-a11y.md`).

| `tone`       | Meaning                                       | Examples                                 | Glyph                        | Colour   |
| ------------ | --------------------------------------------- | ---------------------------------------- | ---------------------------- | -------- |
| `done`       | Finished, confirmed, available                | `確認済み`, `完了`, `確認可能`, `運用中` | `IconCircleCheckFilled`      | `green`  |
| `failed`     | Stopped with an error                         | `失敗`                                   | `IconCircleXFilled`          | `red`    |
| `attention`  | Needs a closer look before relying on it      | `要確認`, `整理中・未確定`               | `IconAlertTriangleFilled`    | `orange` |
| `awaiting`   | Waiting for the reader to act                 | `確認待ち`, `未確認`                     | `IconCircleArrowRightFilled` | accent   |
| `processing` | The system is working on it                   | `画面を生成中`, `機能を開発中`           | `IconHourglassFilled`        | `gray`   |
| `queued`     | Not started, waiting for something else first | `待機中`                                 | `IconClockFilled`            | `gray`   |

A badge that labels a kind rather than a state (`追加の確認`) is a plain `Badge` with no glyph.

## Icons Do Not Decorate Text

- **Type**: MUST NOT
- **Reason**: An icon in front of running text or a plain value spends the reader's attention on a shape that does not stand for an operation or a state, and teaches them that icons can be ignored.

### Details

No icon inside a sentence, in front of a note or hint, or in front of a plain value in a table cell. A state already has its own mark (`Badge` with a dot, `Alert` with its icon — `design-a11y.md`).
