---
name: create-e2e-test
description: Use when creating Playwright E2E tests, adding E2E test coverage, or when `/create-e2e-test` is invoked. Triggers when user mentions "E2Eテスト", "e2e test", "Playwright test", or asks to test a page/feature end-to-end.
---

# Playwright E2E Test Creation

## Overview

Organize tests MECE by feature axis using Playwright. Auto-generate tests for simple features; collaborate with user for complex ones.

POM conventions are defined in `.claude/rules/e2e-pom-standards.md` — follow them when creating POM files.

## Feature Categories

| Category               | Scope                                            | Auto-generate      |
| ---------------------- | ------------------------------------------------ | ------------------ |
| Display                | Page render, list, detail, empty state           | Yes                |
| Auth                   | Login, logout, unauthenticated redirect          | Needs confirmation |
| Search / Filter / Sort | Text search, filtering, ordering                 | Yes                |
| Create / Edit / Delete | Form submission, validation, confirmation dialog | Needs confirmation |
| Navigation             | Page transitions, breadcrumbs, back navigation   | Yes                |
| Error handling         | 404, server error, network error                 | Yes                |

**Auto-generation criteria:**

- **Yes**: UI element presence checks, state change verification — inferable from page structure
- **Needs confirmation**: Business logic dependent, external service integration, auth flows

## File Structure

```text
e2e/
  models/                    # Page Object Models
    homePage.ts
    usersPage.ts
  home.test.ts
  users.test.ts
  auth.test.ts
```

**Rules:**

- One file per page or feature domain
- Group by feature category using `test.describe` within each file
- File names: `<feature>.test.ts` (`.spec.ts` is forbidden)
- **Always use Page Object Model (POM)**

## Test Structure Template

```typescript
// e2e/users.test.ts
import { expect, test } from '@playwright/test';
import { UsersPage } from '@e2e/models/usersPage';

test.describe('一覧表示', () => {
  test('ページにアクセスした場合、一覧が表示されること', async ({ page }) => {
    const usersPage = new UsersPage(page);

    await usersPage.goto();

    await expect(usersPage.list).toBeVisible();
  });
});

test.describe('検索', () => {
  test('検索キーワードを入力した場合、該当する結果のみ表示されること', async ({ page }) => {
    const usersPage = new UsersPage(page);
    await usersPage.goto();

    await usersPage.search('田中');

    await expect(usersPage.list).toHaveCount(1);
  });
});
```

## Naming Convention

Test names use the format **「〇〇の場合、△△であること」** (condition → expected outcome).

```typescript
// Good
test('検索キーワードを入力した場合、該当する結果のみ表示されること', ...)
test('未認証の場合、ログインページにリダイレクトされること', ...)

// Bad
test('検索が動く', ...)
test('search works', ...)
```

## MECE Checklist

Verify the following for each page/feature to ensure no gaps:

**Display:**

- [ ] Normal display (with data)
- [ ] Empty state (no data)
- [ ] Loading state

**Operations (when applicable):**

- [ ] Happy path (success)
- [ ] Error path (validation errors)
- [ ] Boundary values (max length, 0 items, large dataset)

**Navigation:**

- [ ] Page transitions
- [ ] Browser back

## Workflow

```dot
digraph e2e_workflow {
  "User specifies page/feature" [shape=box];
  "Check page implementation" [shape=box];
  "Classify by feature category" [shape=box];
  "Auto-generate possible?" [shape=diamond];
  "Create POM + auto-generate tests" [shape=box];
  "Ask user to clarify requirements" [shape=box];
  "Create POM + generate tests" [shape=box];
  "MECE check" [shape=box];
  "Gaps found?" [shape=diamond];
  "Propose additional tests" [shape=box];
  "Done" [shape=doublecircle];

  "User specifies page/feature" -> "Check page implementation";
  "Check page implementation" -> "Classify by feature category";
  "Classify by feature category" -> "Auto-generate possible?";
  "Auto-generate possible?" -> "Create POM + auto-generate tests" [label="yes"];
  "Auto-generate possible?" -> "Ask user to clarify requirements" [label="needs confirmation"];
  "Ask user to clarify requirements" -> "Create POM + generate tests";
  "Create POM + auto-generate tests" -> "MECE check";
  "Create POM + generate tests" -> "MECE check";
  "MECE check" -> "Gaps found?";
  "Gaps found?" -> "Propose additional tests" [label="yes"];
  "Gaps found?" -> "Done" [label="no"];
  "Propose additional tests" -> "MECE check";
}
```

## User Question Template (Needs Confirmation Category)

For features requiring confirmation, ask about:

1. **Auth**: Login method? How to prepare test users?
2. **Create / Edit**: Required fields? Validation rules? Redirect after success?
3. **External integration**: Mock or real? Test endpoint available?

## Consistency with Existing Tests

- Follow project ESLint rules (`eslint-plugin-playwright`)
- `@typescript-eslint/no-magic-numbers` is disabled for E2E tests
- Use `_` separator for numeric literals (e.g., `10_000`)
