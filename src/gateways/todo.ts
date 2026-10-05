import { z } from 'zod';

import type { Result } from '@/entities/result';

import { schema, type Todo } from '@/entities/todo';
import { prisma } from '@/gateways/prismaClient';

const todoListSchema = z.array(schema).readonly();

// Prisma は接続やクエリの失敗を例外で返すため、ここで Result に変える
const findTodoRecords = async (): Promise<
  Result<Awaited<ReturnType<typeof prisma.todo.findMany>>>
> => {
  try {
    return { ok: true, value: await prisma.todo.findMany({ orderBy: { createdAt: 'asc' } }) };
  } catch (error) {
    return { error: error instanceof Error ? error : new Error(String(error)), ok: false };
  }
};

export const fetchTodoList = async (): Promise<Result<readonly Todo[]>> => {
  const recordsResult = await findTodoRecords();
  if (!recordsResult.ok) {
    return recordsResult;
  }

  const todoListResult = todoListSchema.safeParse(
    recordsResult.value.map((record) => ({
      createdAt: record.createdAt.toISOString(),
      id: record.id,
      isCompleted: record.completed,
      title: record.title,
    }))
  );
  return todoListResult.success
    ? { ok: true, value: todoListResult.data }
    : { error: new Error(`Todo のレコードが不正です: ${todoListResult.error.message}`), ok: false };
};
