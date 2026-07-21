---
description: Rules for Japanese UI copy in pages, components, and stories
paths: ['src/app/**/*.tsx', 'src/features/**/*.tsx', 'src/shared-components/**/*.tsx']
---

# UI Copy Rules

All user-facing text is Japanese. Every rule below describes an observable property of the text, not a matter of taste.

## Action Labels Name Their Object

A destructive or irreversible action states both the verb and the object it acts on. A bare verb forces the user to reconstruct the target from surrounding context.

```typescript
// Good
<Button variant="destructive">プロジェクトを削除</Button>

// Bad
<Button variant="destructive">削除</Button>
```

Non-destructive actions in an unambiguous context may use the verb alone (`保存`, `検索`).

## Confirmation Dialogs Never Use OK / Cancel

The confirming button repeats the action. `OK` tells the user nothing about what they are agreeing to, which is exactly the moment they need to know.

```typescript
// Good
<Button variant="destructive">削除する</Button>
<Button variant="outline">キャンセル</Button>

// Bad
<Button variant="destructive">OK</Button>
```

## Navigation and Headings Are Nouns

Navigation items and headings name objects. Actions belong on buttons, presented after the user has chosen an object. This is the user-facing form of the noun-based naming already required for files in `coding-standards.md`.

```typescript
// Good
<nav><Link href="/orders">注文</Link></nav>

// Bad
<nav><Link href="/orders">注文する</Link></nav>
```

## Politeness Level

Body text uses the polite form (`です` / `ます`). Buttons, labels, and headings end with a noun or use the plain dictionary form. Never mix polite and plain forms within body text.

```typescript
// Good
<p>変更内容は自動的に保存されます</p>

// Bad
<p>変更内容は自動的に保存される</p>
```

## Punctuation

- Buttons, labels, headings, and single-sentence helper text take no full stop (`。`)
- Body text of two or more sentences takes a full stop on every sentence
- Use the Japanese comma (`、`), never `,`

```typescript
// Good
<p>変更内容は自動的に保存されます</p>
<p>この操作は取り消せません。削除する前に内容を確認してください。</p>

// Bad
<p>変更内容は自動的に保存されます。</p>
```

## Error Messages State the Cause and the Next Step

Two elements are required: what went wrong, and what the user can do about it. A message carrying only the first is a dead end — the same failure `design-states.md` forbids for the Error state.

Never assign blame to the user.

```typescript
// Good
'メールアドレスの形式が正しくありません。example@example.com の形式で入力してください。';

// Bad: no next step
'エラーが発生しました';

// Bad: blames the user, and still no next step
'不正な入力です';
```

## Empty State Copy States What Is Absent and the First Step

An empty state is the user's first encounter with a feature. Name what is missing, then give the action that fills it.

```typescript
// Good
'注文はまだありません。商品を選ぶとここに表示されます。';

// Bad
'データがありません';
```

## No First or Second Person

The system does not refer to itself as `私たち`. The interface does not address the user as `あなた`. Both read as translated English in a Japanese interface.

```typescript
// Good
'設定を保存しました';

// Bad
'あなたの設定を保存しました';
```

## Notation

| Item              | Rule                                                     | Example          |
| ----------------- | -------------------------------------------------------- | ---------------- |
| Numbers           | Half-width                                               | `3件`            |
| Latin characters  | Half-width                                               | `URL`            |
| Mixed-script gaps | No space between Japanese and half-width Latin or digits | `3件のURLを確認` |

## Terminology Is Enforced by a Dictionary

One concept gets one word. The dictionary lives in `prh.yml` at the repository root and is checked by `pnpm run lint:text`, which runs on every commit and in CI. It is the single source of truth — do not restate its entries here.

Adding a term means adding an entry to `prh.yml`. It takes effect immediately; there is no separate list to keep in sync.

```yaml
- expected: ユーザー
  patterns:
    - '/ユーザ(?![ァ-ヶー])/'
```

`pnpm run lint:text:fix` rewrites every violation automatically.

### What the dictionary cannot decide

The dictionary handles spelling variants — cases where one form is always correct (`ユーザ` → `ユーザー`, `サインイン` → `ログイン`). It must not be used for word choices that depend on meaning.

`削除` / `破棄` / `消去` are a case in point: `契約を破棄` and `履歴を消去` are correct Japanese, so a blanket rewrite would corrupt them. Pick the right word by meaning, and prefer `削除` for removing a stored object.
