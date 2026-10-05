import { describe, expect, it } from 'vitest';

import { prisma } from '@/gateways/prismaClient';
import { createTodo, listTodos, updateTodo } from '@/gateways/todoGateway';

describe('listTodos', () => {
  it('Todoが1件も存在しない場合、空の配列のResultを返すこと', async () => {
    const actual = await listTodos();

    const expected = { ok: true, value: [] };
    expect(actual).toEqual(expected);
  });

  it('completedがtrueのレコードが存在する場合、isCompletedがtrueのTodoを返すこと', async () => {
    await prisma.todo.create({ data: { completed: true, title: 'タスク' } });

    const todosResult = await listTodos();
    const actual = todosResult.ok ? todosResult.value[0]?.isCompleted : null;

    const expected = true;
    expect(actual).toBe(expected);
  });

  it('複数のTodoが存在する場合、createdAtの昇順で返すこと', async () => {
    await prisma.todo.create({
      data: { createdAt: new Date('2026-02-01T00:00:00.000Z'), title: '後' },
    });
    await prisma.todo.create({
      data: { createdAt: new Date('2026-01-01T00:00:00.000Z'), title: '先' },
    });

    const todosResult = await listTodos();
    const actual = todosResult.ok ? todosResult.value.map((todo) => todo.title) : null;

    const expected = ['先', '後'];
    expect(actual).toEqual(expected);
  });
});

describe('createTodo', () => {
  it('titleを渡した場合、未完了のTodoを保存して返すこと', async () => {
    const todoResult = await createTodo({ title: '買い物' });
    const actual = todoResult.ok
      ? { isCompleted: todoResult.value.isCompleted, title: todoResult.value.title }
      : null;

    const expected = { isCompleted: false, title: '買い物' };
    expect(actual).toEqual(expected);
  });
});

describe('updateTodo', () => {
  it('存在するidを渡した場合、isCompletedを更新したTodoを返すこと', async () => {
    const record = await prisma.todo.create({ data: { title: 'タスク' } });

    const todoResult = await updateTodo({ id: record.id, isCompleted: true });
    const actual = todoResult.ok ? todoResult.value?.isCompleted : null;

    const expected = true;
    expect(actual).toBe(expected);
  });

  it('存在しないidを渡した場合、nullのResultを返すこと', async () => {
    const actual = await updateTodo({
      id: '0b7f4e59-1f2a-4d4f-9a39-3e0b8f2a6c11',
      isCompleted: true,
    });

    const expected = { ok: true, value: null };
    expect(actual).toEqual(expected);
  });
});
