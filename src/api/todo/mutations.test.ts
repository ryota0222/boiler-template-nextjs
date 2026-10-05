import { QueryClient } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Todo } from '@/entities/todo';

import { todoCompletionMutationOptions, todoCreationMutationOptions } from '@/api/todo/mutations';
import { todoListQueryKey } from '@/api/todo/queries';

const todo: Todo = {
  createdAt: '2026-10-05T00:00:00.000Z',
  id: '0b7f4e59-1f2a-4d4f-9a39-3e0b8f2a6c11',
  isCompleted: false,
  title: '買い物',
};

const createContext = (
  client: QueryClient
): Parameters<NonNullable<typeof todoCompletionMutationOptions.onMutate>>[1] => ({
  client,
  meta: {},
  mutationKey: ['todos', 'completion'],
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('todoCreationMutationOptions', () => {
  it('mutationFnにtitleを渡した場合、POSTで追加の要求を送ること', async () => {
    const fetchMock = vi.fn(() => Promise.resolve(Response.json(todo, { status: 201 })));
    vi.stubGlobal('fetch', fetchMock);

    await todoCreationMutationOptions.mutationFn?.('買い物', createContext(new QueryClient()));
    const actual = fetchMock.mock.calls[0];

    const expected = [
      '/api/todos',
      {
        body: '{"title":"買い物"}',
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      },
    ];
    expect(actual).toEqual(expected);
  });
});

describe('todoCompletionMutationOptions', () => {
  it('onMutateで一覧が読めている場合、対象のTodoのisCompletedを先に書き換えること', async () => {
    const client = new QueryClient();
    client.setQueryData(todoListQueryKey, { ok: true, value: [todo] });

    await todoCompletionMutationOptions.onMutate?.(
      { id: todo.id, isCompleted: true },
      createContext(client)
    );
    const actual = client.getQueryData(todoListQueryKey);

    const expected = { ok: true, value: [{ ...todo, isCompleted: true }] };
    expect(actual).toEqual(expected);
  });

  it('onMutateで一覧が失敗のResultの場合、そのまま残すこと', async () => {
    const client = new QueryClient();
    const failure = { error: { kind: 'internal', message: '読めません' }, ok: false };
    client.setQueryData(todoListQueryKey, failure);

    await todoCompletionMutationOptions.onMutate?.(
      { id: todo.id, isCompleted: true },
      createContext(client)
    );
    const actual = client.getQueryData(todoListQueryKey);

    const expected = failure;
    expect(actual).toEqual(expected);
  });

  it('onSettledで結果が失敗のResultの場合、onMutateの前の一覧に戻すこと', async () => {
    const client = new QueryClient();
    client.setQueryData(todoListQueryKey, { ok: true, value: [{ ...todo, isCompleted: true }] });

    await todoCompletionMutationOptions.onSettled?.(
      { error: { kind: 'internal', message: '更新できません' }, ok: false },
      null,
      { id: todo.id, isCompleted: true },
      { snapshot: { ok: true, value: [todo] } },
      createContext(client)
    );
    const actual = client.getQueryData(todoListQueryKey);

    const expected = { ok: true, value: [todo] };
    expect(actual).toEqual(expected);
  });

  it('onSettledで結果が成功のResultの場合、書き換えた一覧を残すこと', async () => {
    const client = new QueryClient();
    client.setQueryData(todoListQueryKey, { ok: true, value: [{ ...todo, isCompleted: true }] });

    await todoCompletionMutationOptions.onSettled?.(
      { ok: true, value: { ...todo, isCompleted: true } },
      null,
      { id: todo.id, isCompleted: true },
      { snapshot: { ok: true, value: [todo] } },
      createContext(client)
    );
    const actual = client.getQueryData(todoListQueryKey);

    const expected = { ok: true, value: [{ ...todo, isCompleted: true }] };
    expect(actual).toEqual(expected);
  });
});
