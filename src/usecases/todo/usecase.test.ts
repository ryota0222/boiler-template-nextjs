import { describe, expect, it, vi } from 'vitest';

import type { Result } from '@/entities/result';
import type { Todo } from '@/entities/todo';

import { createTodoUsecase } from '@/usecases/todo/usecase';

const todo: Todo = {
  createdAt: '2026-10-05T00:00:00.000Z',
  id: '0b7f4e59-1f2a-4d4f-9a39-3e0b8f2a6c11',
  isCompleted: false,
  title: '買い物',
};

const createUsecase = ({
  createdResult,
  listedResult,
  printErrorLog,
  updatedResult,
}: {
  createdResult: Result<Todo>;
  listedResult: Result<readonly Todo[]>;
  printErrorLog: (error: Error) => void;
  updatedResult: Result<null | Todo>;
}): ReturnType<typeof createTodoUsecase> =>
  createTodoUsecase({
    gateways: {
      createTodo: () => Promise.resolve(createdResult),
      listTodos: () => Promise.resolve(listedResult),
      printErrorLog,
      updateTodo: () => Promise.resolve(updatedResult),
    },
  });

const updateInput = {
  input: { body: { isCompleted: true }, parameters: { id: todo.id } },
};

describe('createTodoUsecase', () => {
  it('listでlistTodosが成功した場合、Todoの一覧を返すこと', async () => {
    const actual = await createUsecase({
      createdResult: { ok: true, value: todo },
      listedResult: { ok: true, value: [todo] },
      printErrorLog: vi.fn(),
      updatedResult: { ok: true, value: todo },
    }).list();

    const expected = { ok: true, value: [todo] };
    expect(actual).toEqual(expected);
  });

  it('listでlistTodosが失敗した場合、internalの失敗を返すこと', async () => {
    const todosResult = await createUsecase({
      createdResult: { ok: true, value: todo },
      listedResult: { error: new Error('接続できません'), ok: false },
      printErrorLog: vi.fn(),
      updatedResult: { ok: true, value: todo },
    }).list();
    const actual = todosResult.ok ? null : todosResult.error.kind;

    const expected = 'internal';
    expect(actual).toBe(expected);
  });

  it('createでcreateTodoが成功した場合、追加したTodoを返すこと', async () => {
    const actual = await createUsecase({
      createdResult: { ok: true, value: todo },
      listedResult: { ok: true, value: [] },
      printErrorLog: vi.fn(),
      updatedResult: { ok: true, value: todo },
    }).create({ input: { body: { title: '買い物' } } });

    const expected = { ok: true, value: todo };
    expect(actual).toEqual(expected);
  });

  it('createでcreateTodoが失敗した場合、元のエラーをログに記録すること', async () => {
    const printErrorLog = vi.fn();
    const error = new Error('保存できません');

    await createUsecase({
      createdResult: { error, ok: false },
      listedResult: { ok: true, value: [] },
      printErrorLog,
      updatedResult: { ok: true, value: todo },
    }).create({ input: { body: { title: '買い物' } } });

    expect(printErrorLog).toHaveBeenCalledWith(error);
  });

  it('updateでupdateTodoが更新したTodoを返した場合、そのTodoを返すこと', async () => {
    const actual = await createUsecase({
      createdResult: { ok: true, value: todo },
      listedResult: { ok: true, value: [] },
      printErrorLog: vi.fn(),
      updatedResult: { ok: true, value: { ...todo, isCompleted: true } },
    }).update(updateInput);

    const expected = { ok: true, value: { ...todo, isCompleted: true } };
    expect(actual).toEqual(expected);
  });

  it('updateでupdateTodoがnullを返した場合、not-foundの失敗を返すこと', async () => {
    const todoResult = await createUsecase({
      createdResult: { ok: true, value: todo },
      listedResult: { ok: true, value: [] },
      printErrorLog: vi.fn(),
      updatedResult: { ok: true, value: null },
    }).update(updateInput);
    const actual = todoResult.ok ? null : todoResult.error.kind;

    const expected = 'not-found';
    expect(actual).toBe(expected);
  });

  it('updateでupdateTodoが失敗した場合、internalの失敗を返すこと', async () => {
    const todoResult = await createUsecase({
      createdResult: { ok: true, value: todo },
      listedResult: { ok: true, value: [] },
      printErrorLog: vi.fn(),
      updatedResult: { error: new Error('接続できません'), ok: false },
    }).update(updateInput);
    const actual = todoResult.ok ? null : todoResult.error.kind;

    const expected = 'internal';
    expect(actual).toBe(expected);
  });
});
