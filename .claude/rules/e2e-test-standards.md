---
description: Standards for writing E2E tests in e2e/*.test.ts
paths: ['e2e/**/*.test.ts']
---

# E2E Test Standards

## What E2E Tests Cover

E2E tests verify user stories — scenarios that are meaningful from the user's perspective. This includes both happy paths and error cases that users may encounter.

```text
// Good: user-story scenarios
- 稼働記録を追加した場合、一覧に表示されること
- 稼働時間を入力せずに保存した場合、エラーメッセージが表示されること
- 編集ボタンを押した場合、編集フォームに切り替わること

// Bad: not a user story
- editingProjectがnullの場合、追加フォームがレンダリングされること  ← component unit test
- calculateTaxIncludedAmountがtax_excludedの場合に1.1倍されること   ← unit test
```

## What E2E Tests Do NOT Cover

- Component-level conditional rendering branches → use React Testing Library unit tests
- Pure function logic and boundary values → use Vitest unit tests

The distinction: if it requires a user to navigate, click, or fill a form to trigger the scenario, it belongs in E2E. If it's a code branch that can be exercised by calling a function or rendering a component directly, it belongs in unit tests.

## Test Granularity

Write one test per user-meaningful scenario. Do not bundle multiple unrelated actions into one test.

## When to Write E2E Tests

Write E2E tests at the same time as implementing the feature — not after. Every new screen or user-facing interaction must have corresponding E2E coverage before the implementation is considered complete.

## File Structure

```text
e2e/
  login.test.ts
  work.test.ts           # /work ページのユーザーストーリー
  workProjects.test.ts   # /work/projects ページのユーザーストーリー
  models/
    loginPage.ts
    workPage.ts
    workProjectsPage.ts
  helpers/
    inbucket.ts
```

## Test Data Isolation

E2E tests share a real database and run in parallel by default. Tests MUST NOT depend on global state such as total record counts.

**Rules:**

- Every test that creates data must use a unique name per test run. Generate it at the top of the test file using `Date.now()`:

  ```typescript
  const testProjectName = `テストプロジェクト-${Date.now()}`;
  ```

- Assertions must be scoped to the specific data created by that test — never assert on total counts of elements that include data from other tests.

  ```typescript
  // Good: scoped to the item this test created
  const actual = page.getByText(testProjectName, { exact: true });

  const expected = 0;
  await expect(actual).toHaveCount(expected);

  // Bad: depends on global state, breaks under parallel execution
  await expect(page.getByRole('button', { name: '削除' })).toHaveCount(deleteButtonCountBefore - 1);
  ```

- `afterEach` cleanup must delete by the same unique name so it does not affect other tests' data.

Do NOT add `test.describe.configure({ mode: 'serial' })` as a workaround for isolation — fix the data instead.

## Authenticated Screens

Screens behind authentication require a logged-in session. Use Playwright's `storageState` to share authenticated state across tests rather than logging in on every test.
