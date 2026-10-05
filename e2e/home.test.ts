import { findSeriousAccessibilityViolations } from '@e2e/helpers/accessibilityChecking';
import { HomePage } from '@e2e/models/homePage';
import { expect, test } from '@playwright/test';

test('トップページにアクセスした場合、見出しが表示されること', async ({ page }) => {
  const homePage = new HomePage(page);

  await homePage.goto();

  await expect(homePage.heading).toBeVisible();
});

test('トップページを開いた場合、axe の a11y の検査で serious・critical の違反がないこと', async ({
  page,
}) => {
  const homePage = new HomePage(page);
  await homePage.goto();

  const actual = await findSeriousAccessibilityViolations(page);

  expect(actual).toStrictEqual([]);
});
