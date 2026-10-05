import type { Locator, Page } from '@playwright/test';

export class HomePage {
  readonly addingButton: Locator;
  readonly heading: Locator;
  readonly todoInput: Locator;

  constructor(private readonly page: Page) {
    this.addingButton = page.getByRole('button', { name: 'Todo を追加' });
    this.heading = page.getByRole('heading', { level: 1 });
    this.todoInput = page.getByRole('textbox', { name: 'Todo' });
  }

  async addTodo(title: string): Promise<void> {
    await this.todoInput.fill(title);
    await this.addingButton.click();
  }

  getTodoCheckbox(title: string): Locator {
    return this.page.getByRole('checkbox', { name: title });
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async reload(): Promise<void> {
    await this.page.reload();
  }

  // 完了の切り替えは onMutate の後で画面に出るため、押した瞬間の状態の変化を求める check() ではなく click() で押す
  async toggleTodo(title: string): Promise<void> {
    await this.getTodoCheckbox(title).click();
  }
}
