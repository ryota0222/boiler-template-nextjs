import { HomePage } from '@e2e/models/homePage';
import { expect, test } from '@playwright/test';

// 並べて走るテストが同じ DB を使うため、テストごとに違う名前の Todo を作る
const createTitle = (label: string): string => `${label} ${crypto.randomUUID()}`;

test('Todoを追加した場合、一覧に表示されること', async ({ page }) => {
  const homePage = new HomePage(page);
  const title = createTitle('買い物');
  await homePage.goto();

  await homePage.addTodo(title);

  await expect(homePage.getTodoCheckbox(title)).toBeVisible();
});

test('Todoを完了にした場合、読み込み直しても完了のままであること', async ({ page }) => {
  const homePage = new HomePage(page);
  const title = createTitle('請求書を送る');
  await homePage.goto();
  await homePage.addTodo(title);
  await homePage.toggleTodo(title);
  await expect(homePage.getTodoCheckbox(title)).toBeChecked();

  await homePage.reload();

  await expect(homePage.getTodoCheckbox(title)).toBeChecked();
});
