---
description: Page Object Model conventions for Playwright E2E tests
paths: ['e2e/models/**/*.ts']
---

# E2E Page Object Model Standards

Follow these rules when creating or editing Page Object Model (POM) files in `e2e/models/`.

## File Placement

- Place POM files in `e2e/models/`
- File name: `<pageName>Page.ts` (camelCase + `Page` suffix)
- One class per file, one file per page

```text
e2e/models/
  homePage.ts
  usersPage.ts
```

## Class Structure

- Class name: `<PageName>Page` (PascalCase + `Page` suffix)
- Constructor takes `Page` as `private readonly page`
- Locators as `readonly` properties, initialized in constructor
- Methods return `void` (no fluent API / method chaining)
- **No assertion methods** — POM provides locators and actions only; assertions belong in test files

```typescript
import { type Locator, type Page } from '@playwright/test';

export class UsersPage {
  readonly list: Locator;
  readonly searchBox: Locator;

  constructor(private readonly page: Page) {
    this.list = page.getByRole('list');
    this.searchBox = page.getByRole('searchbox');
  }

  async goto(): Promise<void> {
    await this.page.goto('/users');
  }

  async search(keyword: string): Promise<void> {
    await this.searchBox.fill(keyword);
  }

  getItemByName(name: string): Locator {
    return this.page.getByRole('listitem').filter({ hasText: name });
  }
}
```

## Member Categories

| Category        | Convention                                      | Example                                        |
| --------------- | ----------------------------------------------- | ---------------------------------------------- |
| Locator         | `readonly` property, initialized in constructor | `readonly list: Locator`                       |
| Navigation      | `goto()` method                                 | `async goto(): Promise<void>`                  |
| Action          | Verb method, returns `void`                     | `async search(keyword: string): Promise<void>` |
| Dynamic locator | Returns `Locator`                               | `getItemByName(name: string): Locator`         |

## Selector Priority

Use selectors in this priority order:

1. `getByRole()` — accessibility role (preferred)
2. `getByText()` — visible text
3. `getByLabel()` — form label
4. `getByPlaceholder()` — placeholder
5. `getByTestId()` — last resort

## Splitting Large POM

- Default: one class per page
- When a POM exceeds ~15 methods, split into section classes
- Section class name: `<SectionName>Section`
- Parent POM holds sections as `readonly` properties

### Directory structure after splitting

```text
# Before splitting
e2e/models/
  usersPage.ts

# After splitting
e2e/models/
  users-page/
    usersPage.ts
    internal/
      searchSection.ts
```

- The main POM file moves into `<page-name>/` directory (kebab-case)
- Section classes go into `internal/` (only referenced by the parent POM)
- Import path changes from `@e2e/models/usersPage` to `@e2e/models/users-page/usersPage`

### Section class example

```typescript
// e2e/models/users-page/internal/searchSection.ts
import type { Locator, Page } from '@playwright/test';

export class SearchSection {
  readonly searchBox: Locator;

  constructor(private readonly page: Page) {
    this.searchBox = page.getByRole('searchbox');
  }

  async search(keyword: string): Promise<void> {
    await this.searchBox.fill(keyword);
  }
}
```

```typescript
// e2e/models/users-page/usersPage.ts
import type { Locator, Page } from '@playwright/test';
import { SearchSection } from './internal/searchSection';

export class UsersPage {
  readonly list: Locator;
  readonly searchSection: SearchSection;

  constructor(private readonly page: Page) {
    this.list = page.getByRole('list');
    this.searchSection = new SearchSection(page);
  }

  async goto(): Promise<void> {
    await this.page.goto('/users');
  }
}
```

## Usage in Tests

```typescript
import { expect, test } from '@playwright/test';
import { UsersPage } from '@e2e/models/usersPage';

test('検索キーワードを入力した場合、該当する結果のみ表示されること', async ({ page }) => {
  const usersPage = new UsersPage(page);
  await usersPage.goto();

  await usersPage.search('田中');

  await expect(usersPage.list).toHaveCount(1);
});
```
