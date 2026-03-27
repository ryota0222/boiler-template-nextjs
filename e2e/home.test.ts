import { HomePage } from '@e2e/models/homePage';
import { expect, test } from '@playwright/test';

test('トップページにアクセスした場合、見出しが表示されること', async ({ page }) => {
  const homePage = new HomePage(page);

  await homePage.goto();

  await expect(homePage.heading).toBeVisible();
});
