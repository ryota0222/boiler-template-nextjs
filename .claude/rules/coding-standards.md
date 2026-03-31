---
description: Coding best practices (code quality, error handling, performance, language policy)
---

# Coding Best Practices

## Code Quality

- Use meaningful variable and function names that convey purpose
- No abbreviations except widely known ones (e.g., ID, URL) — applies to variable names, function names, and directory names. Widely known abbreviations must always be fully uppercased (e.g., `userID` not `userId`, `parseURL` not `parseUrl`)
- Boolean variable names MUST use a prefix that expresses behavior or state:

  | Pattern               | Examples                     |
  | --------------------- | ---------------------------- |
  | `is` + noun/adjective | `isEnabled`, `isEmpty`       |
  | `has` + noun          | `hasError`, `hasPermission`  |
  | `should` + verb       | `shouldDryRun`, `shouldSkip` |
  | `can` + verb          | `canRetry`, `canDelete`      |

  ```typescript
  // Good
  const isEnabled = true;
  const shouldDryRun = options.dryRun;

  // Bad
  const enabled = true;
  const dryRun = options.dryRun;
  ```

- **NEVER write comments that explain WHAT the code does.** Code must be self-explanatory through naming and structure. Comments are ONLY permitted when explaining WHY — the non-obvious reason or intent behind a decision that cannot be expressed through code alone. JSDoc (`/** */`), inline (`//`), and block (`/* */`) comments are all subject to this rule. If you feel the need to explain what code does, rewrite the code to be clearer instead of adding a comment.

  ```typescript
  // FORBIDDEN: explains what (obvious from the code)
  /** H:MM:SS 形式の時間文字列（時は1〜2桁） */
  export const schema = z.string().regex(/^\d{1,2}:\d{2}:\d{2}$/);

  // FORBIDDEN: explains what
  // エントリをメンバーごとにグルーピングする
  const grouped = groupBy(entries, (e) => e.member);

  // ALLOWED: explains why (non-obvious business reason)
  // eslint-disable-next-line no-inline-comments
  if (entry.project === '-') { ... } // Toggl CSV では未設定値がハイフンで表現されるため
  ```

  ```typescript
  // Good
  const userCount = users.length;
  // Bad
  const uCnt = users.length;
  ```

- No re-exports via `index.ts` (import directly from the defining file)

  ```typescript
  // Good
  import { AuthUser } from '@/entities/AuthUser';
  // Bad
  import { AuthUser } from '@/entities/index';
  ```

- No backward-compatibility code (delete obsolete code immediately)

  ```typescript
  // Good: remove old definition when changing interface
  type User = { id: string; fullName: string };
  // Bad: keeping old interface
  type User = { id: string; fullName: string; /** @deprecated */ name?: string };
  ```

- No fallback handling (throw immediately on errors)

  ```typescript
  // Good
  if (!data.userId) throw new Error('userId is missing');
  // Bad
  const userId = data.userId ?? 'unknown';
  ```

- No single-use variables (inline at the usage site)

  ```typescript
  // Good
  console.log(formatDate(new Date()));
  // Bad
  const formattedDate = formatDate(new Date());
  console.log(formattedDate);
  ```

## Error Handling & Robustness

- Catch unexpected errors and log actionable diagnostics
- Return appropriate exit codes on process termination (success: 0, failure: 1+)
- Always release resources such as file handles and network connections

  ```typescript
  // Good: use `using` declarations or try-finally to ensure cleanup
  await using file = await openFile('data.csv');
  ```

## Performance

- Use streams or batch processing for large data to minimize memory usage

  ```typescript
  // Good: stream processing
  const stream = createReadStream('large.csv');
  // Bad: loading entire file into memory
  const content = readFileSync('large.csv', 'utf-8');
  ```

- Avoid synchronous blocking operations; use async I/O
- Prevent memory leaks by cleaning up object references and event listeners

## Language Policy

- UI messages and console output, code comments, test names, and commit messages must be written in Japanese
- Rule files (`.claude/rules/`, `docs/rules/`) must be written in English

## App Router Entry Constraints

- App Router convention files (layout.tsx, page.tsx, loading.tsx, error.tsx, not-found.tsx) should contain only component exports
- Extract complex logic into separate files in `helpers/`, `features/`, or `shared-components/`
- These files should remain thin wrappers

  ```typescript
  // Good: layout.tsx
  import { AppLayout } from '@/shared-components/appLayout';

  export default function RootLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
    return <AppLayout>{children}</AppLayout>;
  }
  ```

## Internal Directory Placement

Place each `internal/` directory directly under the module directory it belongs to, not under any ancestor directory shared by multiple modules.

```typescript
// Good: formatPrefix belongs to inspection-output, so internal/ lives there
// src/presenters/inspection-output/internal/formatPrefix.ts

// Bad: internal/ placed at a shared ancestor, leaking to siblings
// src/presenters/internal/formatPrefix.ts
// src/internal/formatPrefix.ts
```

## ESLint Disable Comments

When suppressing an ESLint rule with `// eslint-disable-next-line` or `/* eslint-disable */`, always add a Japanese comment on the line above explaining why the rule is being disabled.

```typescript
// Good
// ANSIエスケープコード（\u001b）はターミナルカラー除去のために意図的に使用
// eslint-disable-next-line no-control-regex
const stripped = output.replace(/\u001b\[[0-9;]*m/g, '');

// RGB値は本質的に数値であり定数として定義している
/* eslint-disable @typescript-eslint/no-magic-numbers */
const from: [number, number, number] = [255, 120, 200];
/* eslint-enable @typescript-eslint/no-magic-numbers */

// Bad: no reason given
// eslint-disable-next-line no-control-regex
const stripped = output.replace(/\u001b\[[0-9;]*m/g, '');
```

## remeda Usage

remeda is the standard utility library for this project. Prefer remeda functions over hand-rolled equivalents whenever one exists.

- **Actively use remeda** for data transformation: `pick`, `omit`, `groupBy`, `sortBy`, `mapValues`, `pipe`, etc.
- **Never compare against `undefined` directly** — ESLint enforces `no-undefined`. Use remeda type guards instead:
  - `isDefined(x)` — true when `x` is not `undefined`
  - `isNonNullish(x)` — true when `x` is neither `undefined` nor `null`

  ```typescript
  // Good
  import { isDefined } from 'remeda';
  const active = items.filter(isDefined);
  if (isDefined(user.name)) { ... }

  // Bad: forbidden by no-undefined rule
  const active = items.filter((x) => x !== undefined);
  if (user.name !== undefined) { ... }
  ```

## Additional Rules

- Follow all rule files under `docs/rules/` (except `template.md`)
