import { notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderWithUi } from '@template/ui/testing/TestRendering';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ApiFailure } from '@/entities/apiFailure';
import type { Result } from '@/entities/result';
import type { Todo } from '@/entities/todo';

import { todoListQueryKey } from '@/api/todo/queries';
import { TodoList } from '@/features/todo-list/TodoList';

vi.mock('@mantine/notifications', () => ({ notifications: { show: vi.fn() } }));

const todo: Todo = {
  createdAt: '2026-10-05T00:00:00.000Z',
  id: '0b7f4e59-1f2a-4d4f-9a39-3e0b8f2a6c11',
  isCompleted: false,
  title: '買い物',
};

const renderTodoList = (todosResult: null | Result<readonly Todo[], ApiFailure>): void => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { enabled: false } } });
  if (todosResult !== null) {
    queryClient.setQueryData(todoListQueryKey, todosResult);
  }

  renderWithUi(
    <QueryClientProvider client={queryClient}>
      <TodoList />
    </QueryClientProvider>
  );
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('TodoList', () => {
  it('一覧が読めた場合、Todoをチェックボックスで出すこと', () => {
    renderTodoList({ ok: true, value: [todo] });

    const actual = screen.getByRole('checkbox', { name: '買い物' });

    expect(actual).toBeInTheDocument();
  });

  it('一覧が空の場合、まだないことを伝えること', () => {
    renderTodoList({ ok: true, value: [] });

    const actual = screen.getByText('Todo はまだありません');

    expect(actual).toBeInTheDocument();
  });

  it('一覧をまだ読めていない場合、読み込み中であることを伝えること', () => {
    renderTodoList(null);

    const actual = screen.getByRole('status', { name: 'Todo の一覧を読み込み中' });

    expect(actual).toBeInTheDocument();
  });

  it('一覧の取得が失敗してもう一度読み込むを押した場合、一覧を読み直すこと', async () => {
    const fetchMock = vi.fn(() => Promise.resolve(Response.json([], { status: 200 })));
    vi.stubGlobal('fetch', fetchMock);
    renderTodoList({ error: { kind: 'internal', message: '読めません' }, ok: false });

    fireEvent.click(screen.getByRole('button', { name: 'もう一度読み込む' }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/todos', { body: null, method: 'GET' });
    });
  });

  it('完了の切り替えが失敗した場合、通知で失敗を伝えること', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(
          Response.json(
            { error: { kind: 'not-found', message: '指定した Todo がありません' } },
            { status: 404 }
          )
        )
      )
    );
    renderTodoList({ ok: true, value: [todo] });

    fireEvent.click(screen.getByRole('checkbox', { name: '買い物' }));

    await waitFor(() => {
      expect(notifications.show).toHaveBeenCalledWith({
        color: 'red',
        message: '指定した Todo がありません',
        title: 'Todo を更新できませんでした',
      });
    });
  });
});
