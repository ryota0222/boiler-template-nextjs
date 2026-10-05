---
description: Coding best practices (code quality, error handling)
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

  Do not use negated forms (`isNot`, `hasNo`, `shouldNot`) — use affirmative names and negate at the call site.

  ```typescript
  // Good
  const isEnabled = true;
  const shouldDryRun = options.dryRun;
  const hasValue = (value: unknown): boolean => value !== null;

  // Bad
  const enabled = true;
  const dryRun = options.dryRun;
  const isNotNull = (value: unknown): boolean => value !== null;
  ```

- File names must be noun-based (representing the concept or concern they own);
  verb-based file names are forbidden. Follow the case conventions of the layer
  they belong to:

  | Layer                | Convention                                          | Example                                |
  | -------------------- | --------------------------------------------------- | -------------------------------------- |
  | `entities/`          | camelCase noun                                      | `user.ts`, `order.ts`                  |
  | `gateways/`          | camelCase noun, no `Gateway` suffix                 | `user.ts`, `userQuery.ts`              |
  | `presenters/`        | camelCase noun (suffix optional, e.g., `Presenter`) | `userPresenter.ts`, `userFormatter.ts` |
  | `helpers/`           | camelCase noun                                      | `apiClient.ts`                         |
  | `features/`          | dir: kebab-case noun; component: PascalCase         | `user-profile/UserProfile.tsx`         |
  | `shared-components/` | dir: kebab-case noun; component: PascalCase         | `button/Button.tsx`                    |
  | `stores/`            | dir: kebab-case noun; store: camelCase noun         | `notification/notificationStore.ts`    |

  A subdirectory groups several modules or several concerns under one name. A
  source file and its co-located test are not a group — keep them flat, so the
  import path stays `@/entities/todo` rather than `@/entities/todo/todo`:

  ```text
  // Good: flat — a module and its test
  entities/user.ts
  entities/user.test.ts

  // Good: subdirectory — several concerns of one domain
  gateways/todo/todo.ts
  gateways/todo/todoQuery.ts
  gateways/todo/todoMutation.ts

  // Good: subdirectory — sub-modules under one concept
  entities/todo/item.ts
  entities/todo/list.ts

  // Bad: subdirectory for a lone module and its test
  entities/user/user.ts
  entities/user/user.test.ts
  ```

  This applies to `entities/`, `gateways/`, `presenters/`, and `helpers/`.

  When a word in a file name could be read as either a verb or a noun (`retry`, `run`, `update`, `read`, `parse`), use the gerund (`retrying`, `running`, `updating`, `reading`, `parsing`). A file names a unit of work, and the gerund names that activity without ambiguity; the functions inside still follow the verb-phrase convention.

  ```text
  // Good
  helpers/exponentialBackoffRetrying.ts
  entities/safeParsingToResult.ts

  // Bad: verb or noun?
  helpers/exponentialBackoffRetry.ts
  entities/safeParseToResult.ts
  ```

  For `features/` and `shared-components/`, the directory name and the component file name (without extension) must match using kebab-case ↔ PascalCase conversion:

  ```text
  // Good
  features/login-form/LoginForm.tsx
  shared-components/user-avatar/UserAvatar.tsx

  // Bad
  features/login/LoginForm.tsx       ← directory and component name don't match
  features/login-form/Login.tsx      ← directory and component name don't match
  ```

  ```typescript
  // Good
  // src/gateways/user/user.ts
  export function getUser() { ... }
  export function updateUser() { ... }

  // Bad
  // src/gateways/getUser.ts
  export function getUser() { ... }
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

- No fallback handling (return an error `Result` immediately instead of substituting a default)

  ```typescript
  // Good
  if (data.userId === null) {
    return { error: new Error('userId is missing'), ok: false };
  }
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

- Declare variables immediately before their first use, not at the top of a function or module scope

  ```typescript
  // Good: declared just before use
  const run = (): void => {
    doSomething();
    const decimalPlaces = 2;
    console.log(value.toFixed(decimalPlaces));
  };

  // Bad: declared far from use
  const decimalPlaces = 2;
  const run = (): void => {
    doSomething();
    console.log(value.toFixed(decimalPlaces));
  };
  ```

- No single-use type definitions (inline at the usage site). Define a `type` only when it is used in more than one place.

  ```typescript
  // Good: inline in the function signature
  const run = async ({ argv }: { readonly argv: readonly string[] }): Promise<void> => { ... };

  // Bad: a type used only once
  type RunParameters = { readonly argv: readonly string[] };
  const run = async ({ argv }: RunParameters): Promise<void> => { ... };
  ```

## Error Handling & Robustness

Functions never throw. They return a discriminated union that the caller narrows before use; the type lives in `src/helpers/result.ts`.

```typescript
type Result<T> =
  { readonly ok: true; readonly value: T } | { readonly ok: false; readonly error: Error };
```

Narrow with `if (!result.ok)` and return early. Do not reach for `try`/`catch` except at the boundary where an external API throws — convert the thrown value into a `Result` there and return it.

Validate external data with a zod schema and `safeParse`, then map the outcome onto `Result`. Do not use manual type guards, and do not use `parse`, which throws.

- Catch unexpected errors and log actionable diagnostics
- Clean up resources to prevent memory leaks (e.g. abort fetch requests, remove event listeners)

  ```typescript
  // Good: cancel in-flight requests on unmount
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/data', { signal: controller.signal });
    return () => controller.abort();
  }, []);
  ```

## Performance

- Use streams or batch processing for large data to minimize memory usage

  ```typescript
  // Good: stream processing
  const stream = createReadStream('large.csv');
  // Bad: loading the entire file into memory
  const content = readFileSync('large.csv', 'utf-8');
  ```

## Language Policy

- User-facing messages (UI copy, API error messages), code comments, test names, and commit messages are written in Japanese
- Rule files (`.claude/rules/`) are written in English

## If Statement Style

Always use block form for `if` statements. Single-line `if` is forbidden.

```typescript
// Good
if (!result.ok) {
  return result;
}

// Bad
if (!result.ok) return result;
```

## Nesting Limit

Maximum nesting depth is 1 level inside a function body. Extract nested logic into separate functions.

```typescript
// Good: flat with an extracted function
const dryRun = async (...) => {
  if (!result.ok) {
    return result;
  }
  return { ok: true, value: undefined };
};

const addContext = async (...) => {
  if (command.isDryRun) {
    return dryRun(...);
  }
  return update(...);
};

// Bad: 2-level nesting
const addContext = async (...) => {
  if (command.isDryRun) {
    if (!result.ok) {
      return result;
    }
  }
};
```

## Higher-Order Function Naming

Name higher-order functions (factories that return functions) as `create` + gerund (`createReadingGlossary`, `createPrintingResult`). Do not use `create` + bare verb (`createReadGlossary`), because two verbs in a row are not grammatical.

## Blank Line Grouping

Group related statements into logical blocks separated by blank lines. Each block is one step of the function's work (fetch data, check the error, compute the result). Do not write long sequences of statements without blank lines.

```typescript
// Good: grouped by step
const todosResult = await fetchTodoList();
if (!todosResult.ok) {
  return todosResult;
}

const summary = summarizeTodos(todosResult.value);

// Bad: no blank lines between unrelated steps
const todosResult = await fetchTodoList();
if (!todosResult.ok) {
  return todosResult;
}
const summary = summarizeTodos(todosResult.value);
```

## No Shared Base Types

Do not group several functions' dependencies into a shared base type. Each function defines its own dependency type, so that a change to one function does not affect the others.

```typescript
// Good: each function has its own type
type AddTodoGateways = { readonly saveTodo: SaveTodo };
type CompleteTodoGateways = { readonly updateTodo: UpdateTodo };

// Bad: a shared base couples unrelated functions
type BaseGateways = { readonly readTodo: ReadTodo };
type AddTodoGateways = BaseGateways & { readonly saveTodo: SaveTodo };
```

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
