import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderWithUi } from '@template/ui/testing/TestRendering';
import { fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { TodoAddForm } from '@/features/todo-list/internal/todo-add-form/TodoAddForm';

const createdTodo = {
  createdAt: '2026-10-05T00:00:00.000Z',
  id: '0b7f4e59-1f2a-4d4f-9a39-3e0b8f2a6c11',
  isCompleted: false,
  title: '買い物',
};

const renderForm = (): void => {
  renderWithUi(
    <QueryClientProvider client={new QueryClient()}>
      <TodoAddForm />
    </QueryClientProvider>
  );
};

const typeTitle = (title: string): void => {
  fireEvent.change(screen.getByRole('textbox', { name: 'Todo' }), { target: { value: title } });
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('TodoAddForm', () => {
  it('何も入力せずに入力欄から離れた場合、入力を促すこと', () => {
    renderForm();

    fireEvent.blur(screen.getByRole('textbox', { name: 'Todo' }));
    const actual = screen.getByText('Todo の内容を入力してください');

    expect(actual).toBeInTheDocument();
  });

  it('何も入力していない場合、Todoを追加を押せないこと', () => {
    renderForm();

    const actual = screen.getByRole('button', { name: 'Todo を追加' });

    expect(actual).toBeDisabled();
  });

  it('入力してTodoを追加を押し追加できた場合、入力欄を空にすること', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(Response.json(createdTodo, { status: 201 })))
    );
    renderForm();
    typeTitle('  買い物  ');

    fireEvent.click(screen.getByRole('button', { name: 'Todo を追加' }));

    await expect.poll(() => screen.getByRole('textbox', { name: 'Todo' })).toHaveValue('');
  });

  it('追加が失敗した場合、失敗の理由を伝えること', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(
          Response.json(
            { error: { kind: 'internal', message: 'Todo を追加できませんでした' } },
            { status: 500 }
          )
        )
      )
    );
    renderForm();
    typeTitle('買い物');

    fireEvent.click(screen.getByRole('button', { name: 'Todo を追加' }));
    const actual = await screen.findByRole('alert');

    expect(actual).toHaveTextContent('Todo を追加できませんでした');
  });
});
