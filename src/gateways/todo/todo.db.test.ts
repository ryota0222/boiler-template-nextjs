import { describe, expect, it } from 'vitest';

import { type Todo } from '@/entities/todo/todo';
import { prisma } from '@/gateways/prismaClient';
import { fetchTodoList } from '@/gateways/todo/todo';

describe('fetchTodoList', () => {
  it('Todoが1件も存在しない場合、空の配列を返すこと', async () => {
    const actual = await fetchTodoList();

    const expected: Todo[] = [];
    expect(actual).toEqual(expected);
  });

  it('completedがtrueのレコードが存在する場合、isCompletedがtrueのTodoを返すこと', async () => {
    await prisma.todo.create({ data: { completed: true, title: 'タスク' } });

    const todoList = await fetchTodoList();
    const actual = todoList[0]?.isCompleted;

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

    const todoList = await fetchTodoList();
    const actual = todoList.map((todo) => todo.title);

    const expected = ['先', '後'];
    expect(actual).toEqual(expected);
  });
});
