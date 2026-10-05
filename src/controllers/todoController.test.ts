import { describe, expect, it, vi } from 'vitest';

import {
  handleCreateTodoRequest,
  handleListTodoRequest,
  handleUpdateTodoRequest,
} from '@/controllers/todoController';

const todo = {
  createdAt: '2026-10-05T00:00:00.000Z',
  id: '0b7f4e59-1f2a-4d4f-9a39-3e0b8f2a6c11',
  isCompleted: false,
  title: '買い物',
};

vi.mock('@/gateways/todoGateway', () => ({
  createTodo: () => Promise.resolve({ ok: true, value: todo }),
  listTodos: () => Promise.resolve({ ok: true, value: [todo] }),
  updateTodo: () => Promise.resolve({ ok: true, value: { ...todo, isCompleted: true } }),
}));

describe('handleListTodoRequest', () => {
  it('GETで呼んだ場合、Todoの一覧を200で返すこと', async () => {
    const response = await handleListTodoRequest(new Request('http://localhost/api/todos'));
    const actual = { body: await response.json(), status: response.status };

    const expected = { body: [todo], status: 200 };
    expect(actual).toEqual(expected);
  });
});

describe('handleCreateTodoRequest', () => {
  it('titleを送った場合、追加したTodoを201で返すこと', async () => {
    const response = await handleCreateTodoRequest(
      new Request('http://localhost/api/todos', {
        body: JSON.stringify({ title: '買い物' }),
        method: 'POST',
      })
    );
    const actual = { body: await response.json(), status: response.status };

    const expected = { body: todo, status: 201 };
    expect(actual).toEqual(expected);
  });
});

describe('handleUpdateTodoRequest', () => {
  it('idとisCompletedを送った場合、更新したTodoを200で返すこと', async () => {
    const response = await handleUpdateTodoRequest(
      new Request(`http://localhost/api/todos/${todo.id}`, {
        body: JSON.stringify({ isCompleted: true }),
        method: 'PATCH',
      }),
      { params: Promise.resolve({ id: todo.id }) }
    );
    const actual = { body: await response.json(), status: response.status };

    const expected = { body: { ...todo, isCompleted: true }, status: 200 };
    expect(actual).toEqual(expected);
  });
});
