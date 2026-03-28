---
description: Test standards for creating and editing test files (*.test.{ts,tsx})
paths: ['**/*.test.ts', '**/*.test.tsx']
---

# Test Standards

Follow these rules when editing `.test.ts` and `.test.tsx` files.

## AAA Pattern

All tests must follow the AAA (Arrange-Act-Assert) pattern.

- **Arrange**: Set up test data and preconditions (may be omitted if unnecessary)
- **Act**: Execute the code under test
- **Assert**: Verify expected results
- **ALWAYS** separate each section with a **blank line**, even when Arrange is omitted (Act and Assert must still be separated by a blank line)

```typescript
// Good: all three sections with blank lines
it('10桁の入力を渡した場合、末尾3桁以外がマスクされること', () => {
  const input = '1234567890';

  const actual = maskString(input);

  const expected = '*******890';
  expect(actual).toBe(expected);
});

// Good: no Arrange, blank line between Act and Assert
it('"15:30:00"のように2桁の時間を渡した場合、パースが成功すること', () => {
  const actual = schema.safeParse('15:30:00');

  const expected = true;
  expect(actual.success).toBe(expected);
});

// Bad: no blank line between Act and Assert
it('...', () => {
  const actual = schema.safeParse('15:30:00');
  const expected = true;
  expect(actual.success).toBe(expected);
});
```

## One Test, One Assertion

Each test verifies exactly one thing with one `expect()` call.

## Test Only Branches

Only write tests for code branches (if/else, switch, ternary, early return). Do not write tests that merely verify string content or output format unless a branch determines the content.

```typescript
// Good: tests a branch (project === '-')
it('Projectが空の場合、1件の警告を返すこと', () => {
  const actual = checkRequiredFields([makeEntry({ project: '-' })]).length;

  const expected = 1;
  expect(actual).toBe(expected);
});

// Bad: no branch tested — just verifying string content
it('Projectが空の場合、警告メッセージにメンバー名を含むこと', () => {
  const actual = checkRequiredFields([makeEntry({ project: '-' })])[0]?.text;

  expect(actual).toContain('田中');
});
```

## `toBe` / `toEqual` Rules

- Store the Act result in an **`actual`** variable (`result`, `output`, `ret`, etc. are not allowed)
- **`actual` must hold the final value being asserted.** Never access properties on `actual` inside `expect()`. Extract the target value in the Act step.
- Store the expected value in an **`expected`** variable
- Use the form `expect(actual).toBe(expected)` or `expect(actual).toEqual(expected)`
- **Never pass literals directly** to `toBe()` / `toEqual()`

```typescript
// Good: actual holds the final value
const actual = schema.safeParse('0:30:00').success;

const expected = true;
expect(actual).toBe(expected);

// Bad: accessing property on actual inside expect
const actual = schema.safeParse('0:30:00');

const expected = true;
expect(actual.success).toBe(expected);

// Bad: using non-standard variable name
expect(result).toBe('*******5678');
```

- This rule applies only when using `toBe` / `toEqual`
- Does not apply to mock verifications (`toHaveBeenCalled`)
- For exception tests (`toThrow`, `rejects.toThrow`) and void function tests (`resolves.not.toThrow`), wrap the call in `const actual = () => fn()` and use `await expect(actual())`

```typescript
// Good: exception test with actual variable
const actual = (): Promise<void> => deleteTimeEntry('some-id');

await expect(actual()).rejects.toThrow('DBエラー');

// Good: void function test with actual variable
const actual = (): Promise<void> => deleteTimeEntry('some-id');

await expect(actual()).resolves.not.toThrow();
```

## Test File Location

Test files are co-located in the **same directory** as their source.

```text
src/
  utils/
    maskString.ts
    maskString.test.ts   ← co-located
    Button.tsx
    Button.test.tsx      ← co-located
```

## `describe` Structure

- The first argument of `describe` must be the exact exported name being tested (function name, variable name, etc.)
- Create separate `describe` blocks for each function in the source
- **No single-test `describe`**: If a `describe` contains only one test, it is unnecessary. Write the test directly in the parent `describe` or at the top level

```typescript
// Good: exact export name
describe('schema', () => { ... });
describe('checkRequiredFields', () => { ... });

// Bad: label-style description
describe('resultMessage schema', () => { ... });
describe('duration schema', () => { ... });
```

## Test Names

Write descriptive names in Japanese using the format **「〇〇の場合、△△であること」** (condition → expected outcome).

### Naming Principles

- Condition and outcome are always a pair — never omit either
- Write both condition and outcome in Japanese
- For exception/error tests, use 「エラーが発生すること」 as the outcome
- For boundary value tests, include the specific value in the condition so the boundary is clear (e.g., 「hourlyRateが-1の場合」「hourlyRateが0の場合」)
- For success tests, describe what is returned (e.g., 「プロジェクト一覧を返すこと」「論理削除が完了すること」)

### Standard Outcome Phrases

| Scenario                 | Outcome                  |
| ------------------------ | ------------------------ |
| Return value             | 「〇〇を返すこと」       |
| Parse/validation success | 「パースが成功すること」 |
| Parse/validation failure | 「パースが失敗すること」 |
| Exception/error          | 「エラーが発生すること」 |
| Side effect completion   | 「〇〇が完了すること」   |
| Empty result             | 「空の配列を返すこと」   |

```typescript
// Good
it('正常なレスポンスの場合、プロジェクト一覧を返すこと', () => { ... });
it('hourlyRateが-1の場合、パースが失敗すること', () => { ... });
it('hourlyRateが0の場合、パースが成功すること', () => { ... });
it('Supabaseがエラーを返した場合、エラーが発生すること', () => { ... });

// Bad: missing condition
it('プロジェクト一覧を返すこと', () => { ... });

// Bad: English in outcome
it('Supabaseがエラーを返した場合、Errorをスローすること', () => { ... });
```

## Independence

- Tests must be independent and not depend on execution order
- Mock external dependencies to ensure unit test isolation

## App Router Conventions

- App Router convention files (layout.tsx, page.tsx, loading.tsx, error.tsx, not-found.tsx) are excluded from test coverage
- Extract logic from these files into separate components/functions and test those instead
