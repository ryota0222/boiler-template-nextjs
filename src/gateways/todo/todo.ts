import { schema, type Todo } from '@/entities/todo/todo';
import { prisma } from '@/gateways/prismaClient';

export const fetchTodoList = async (): Promise<Todo[]> => {
  const records = await prisma.todo.findMany({ orderBy: { createdAt: 'asc' } });

  return records.map((record) =>
    schema.parse({
      createdAt: record.createdAt.toISOString(),
      id: record.id,
      isCompleted: record.completed,
      title: record.title,
    })
  );
};
