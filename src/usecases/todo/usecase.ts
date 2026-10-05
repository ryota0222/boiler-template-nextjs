import type { ApiFailure } from '@/entities/apiFailure';
import type { Result } from '@/entities/result';
import type { Todo } from '@/entities/todo';
import type { PrintErrorLog } from '@/usecases/api-request/gateways/errorLogGateway';
import type { CreateTodo, ListTodos, UpdateTodo } from '@/usecases/todo/gateways/todoGateway';

export const createTodoUsecase = ({
  gateways,
}: {
  readonly gateways: {
    readonly createTodo: CreateTodo;
    readonly listTodos: ListTodos;
    readonly printErrorLog: PrintErrorLog;
    readonly updateTodo: UpdateTodo;
  };
}): {
  readonly create: (context: {
    readonly input: { readonly body: { readonly title: string } };
  }) => Promise<Result<Todo, ApiFailure>>;
  readonly list: () => Promise<Result<readonly Todo[], ApiFailure>>;
  readonly update: (context: {
    readonly input: {
      readonly body: { readonly isCompleted: boolean };
      readonly parameters: { readonly id: string };
    };
  }) => Promise<Result<Todo, ApiFailure>>;
} => ({
  create: async ({ input }): Promise<Result<Todo, ApiFailure>> => {
    const todoResult = await gateways.createTodo({ title: input.body.title });
    if (!todoResult.ok) {
      gateways.printErrorLog(todoResult.error);
      return { error: { kind: 'internal', message: 'Todo を追加できませんでした' }, ok: false };
    }

    return todoResult;
  },
  list: async (): Promise<Result<readonly Todo[], ApiFailure>> => {
    const todosResult = await gateways.listTodos();
    if (!todosResult.ok) {
      gateways.printErrorLog(todosResult.error);
      return { error: { kind: 'internal', message: 'Todo の一覧を読めませんでした' }, ok: false };
    }

    return todosResult;
  },
  update: async ({ input }): Promise<Result<Todo, ApiFailure>> => {
    const todoResult = await gateways.updateTodo({
      id: input.parameters.id,
      isCompleted: input.body.isCompleted,
    });
    if (!todoResult.ok) {
      gateways.printErrorLog(todoResult.error);
      return { error: { kind: 'internal', message: 'Todo を更新できませんでした' }, ok: false };
    }

    return todoResult.value === null
      ? { error: { kind: 'not-found', message: '指定した Todo がありません' }, ok: false }
      : { ok: true, value: todoResult.value };
  },
});
