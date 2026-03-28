---
description: Test rules specific to entity schema tests in src/entities/
paths: ['src/entities/**/*.test.ts']
---

# Entity Test Rules

These rules apply in addition to the general test-standards rules.

## Only Test Custom Constraints

Do not test Zod's built-in behavior. Only test **custom constraints** you have added:

- `z.string()` → no test needed (testing zod itself)
- `z.string().nullable()` → test both `null` (pass) and non-null value (pass)
- `z.number().int()` → test decimal (fail) and integer (pass)
- `z.number().nonnegative()` → test `-1` (fail) and `0` (pass)
- `z.string().min(1)` → test `''` (fail) and `'a'` (pass)
- `z.string().regex(pattern)` → test matching value (pass) and non-matching value (fail)
- `z.enum(['OK', 'WARN'])` → test accepted and rejected values
- `z.object({...}).readonly()` → no test needed for readonly
- Custom `.refine()` / `.transform()` → always test

Do NOT write tests that simply parse valid data and check the output — that is testing Zod itself.

## Boundary Value Testing

Always test both sides of the boundary for every custom constraint:

- `.nonnegative()` → test `-1` (fail) AND `0` (pass)
- `.min(1)` → test `''` (fail) AND `'a'` (pass)
- `.nullable()` → test `null` (pass) AND a valid non-null value (pass)
- `.int()` → test `1.5` (fail) AND `1` (pass)
- `.regex(pattern)` → test matching value (pass) AND non-matching value (fail)

Each boundary condition is a separate test case (one assertion per test).

## Use a Shared Valid Input Object

Define a `validInput` constant at the top of the test file with all required fields. Each test overrides only the field under test using spread syntax.

```typescript
const validInput = {
  createdAt: '2025-01-01T00:00:00.000Z',
  deletedAt: null,
  hourlyRate: 3000,
  id: 'db2438cb-c54c-482c-9365-2f581bdc74bd',
  name: 'テスト',
  updatedAt: '2025-01-01T00:00:00.000Z',
  userID: '6c7f9cde-f80c-4d74-b9de-0443b726c326',
};

describe('schema', () => {
  it('hourlyRateが負の値の場合、パースが失敗すること', () => {
    const actual = schema.safeParse({ ...validInput, hourlyRate: -1 }).success;

    const expected = false;
    expect(actual).toBe(expected);
  });
});
```

## Use safeParse for Assertions

Use `schema.safeParse()` instead of `schema.parse()` + `toThrow()`. This allows consistent use of `actual` / `expected` variables per test-standards.

```typescript
// Good
const actual = schema.safeParse({ ...validInput, name: '' }).success;

const expected = false;
expect(actual).toBe(expected);

// Bad
expect(() => schema.parse({ ...validInput, name: '' })).toThrow();
```
