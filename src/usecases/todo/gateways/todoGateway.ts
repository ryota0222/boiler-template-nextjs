import type { Result } from '@/entities/result';
import type { Todo } from '@/entities/todo';

export type CreateTodo = (todo: { readonly title: string }) => Promise<Result<Todo>>;

export type ListTodos = () => Promise<Result<readonly Todo[]>>;

// 指定した id の Todo がないときは null を返す
export type UpdateTodo = (todo: {
  readonly id: string;
  readonly isCompleted: boolean;
}) => Promise<Result<null | Todo>>;
