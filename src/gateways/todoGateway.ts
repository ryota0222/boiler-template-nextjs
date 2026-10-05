import { z } from 'zod';

import type { Result } from '@/entities/result';
import type { CreateTodo, ListTodos, UpdateTodo } from '@/usecases/todo/gateways/todoGateway';

import { schema, type Todo } from '@/entities/todo';
import { prisma } from '@/gateways/prismaClient';

const todoListSchema = z.array(schema).readonly();

type TodoRecord = {
  readonly completed: boolean;
  readonly createdAt: Date;
  readonly id: string;
  readonly title: string;
};

const toTodoInput = (record: TodoRecord): unknown => ({
  createdAt: record.createdAt.toISOString(),
  id: record.id,
  isCompleted: record.completed,
  title: record.title,
});

const toError = (error: unknown): Error =>
  error instanceof Error ? error : new Error(String(error));

// Prisma は接続やクエリの失敗を例外で返すため、ここで Result に変える
const findTodoRecords = async (): Promise<Result<readonly TodoRecord[]>> => {
  try {
    return { ok: true, value: await prisma.todo.findMany({ orderBy: { createdAt: 'asc' } }) };
  } catch (error) {
    return { error: toError(error), ok: false };
  }
};

const insertTodoRecord = async (title: string): Promise<Result<TodoRecord>> => {
  try {
    return { ok: true, value: await prisma.todo.create({ data: { title } }) };
  } catch (error) {
    return { error: toError(error), ok: false };
  }
};

// update は対象がないと例外を投げるため、件数で対象の有無を見てから読み直す
const updateTodoRecord = async ({
  id,
  isCompleted,
}: {
  readonly id: string;
  readonly isCompleted: boolean;
}): Promise<Result<null | TodoRecord>> => {
  try {
    const { count } = await prisma.todo.updateMany({
      data: { completed: isCompleted },
      where: { id },
    });
    return count === 0
      ? { ok: true, value: null }
      : { ok: true, value: await prisma.todo.findUniqueOrThrow({ where: { id } }) };
  } catch (error) {
    return { error: toError(error), ok: false };
  }
};

const parseTodo = (record: TodoRecord): Result<Todo> => {
  const todoResult = schema.safeParse(toTodoInput(record));
  return todoResult.success
    ? { ok: true, value: todoResult.data }
    : { error: new Error(`Todo のレコードが不正です: ${todoResult.error.message}`), ok: false };
};

export const listTodos: ListTodos = async (): Promise<Result<readonly Todo[]>> => {
  const recordsResult = await findTodoRecords();
  if (!recordsResult.ok) {
    return recordsResult;
  }

  const todosResult = todoListSchema.safeParse(
    recordsResult.value.map((record) => toTodoInput(record))
  );
  return todosResult.success
    ? { ok: true, value: todosResult.data }
    : { error: new Error(`Todo のレコードが不正です: ${todosResult.error.message}`), ok: false };
};

export const createTodo: CreateTodo = async ({ title }): Promise<Result<Todo>> => {
  const recordResult = await insertTodoRecord(title);
  if (!recordResult.ok) {
    return recordResult;
  }

  return parseTodo(recordResult.value);
};

export const updateTodo: UpdateTodo = async (todo): Promise<Result<null | Todo>> => {
  const recordResult = await updateTodoRecord(todo);
  if (!recordResult.ok) {
    return recordResult;
  }

  if (recordResult.value === null) {
    return { ok: true, value: null };
  }

  return parseTodo(recordResult.value);
};
