import { mutationOptions } from '@tanstack/react-query';

import type { ApiFailure } from '@/entities/apiFailure';
import type { Result } from '@/entities/result';
import type { Todo } from '@/entities/todo';

import { requestEndpoint } from '@/api/client';
import { createTodoEndpoint, updateTodoEndpoint } from '@/api/todo/endpoints';
import { todoListQueryKey } from '@/api/todo/queries';

type TodoListResult = Result<readonly Todo[], ApiFailure>;

// 新しい Todo の id と作成日時はサーバーが決めるため、楽観的には足さず、追加できてから一覧を読み直す（state-management.md）
export const todoCreationMutationOptions = mutationOptions<Result<Todo, ApiFailure>, Error, string>(
  {
    mutationFn: (title) =>
      requestEndpoint({ endpoint: createTodoEndpoint, input: { body: { title } } }),
    mutationKey: ['todos', 'creation'],
    onSettled: (_result, _error, _title, _onMutateResult, context) =>
      context.client.invalidateQueries({ queryKey: todoListQueryKey }),
  }
);

// requestEndpoint は失敗を例外ではなく Result で返すため onError は呼ばれない。
// 巻き戻しは onSettled で結果を見て行い、例外で止まったときも同じく巻き戻す
export const todoCompletionMutationOptions = mutationOptions<
  Result<Todo, ApiFailure>,
  Error,
  { readonly id: string; readonly isCompleted: boolean },
  { readonly snapshot: TodoListResult | undefined }
>({
  mutationFn: ({ id, isCompleted }) =>
    requestEndpoint({
      endpoint: updateTodoEndpoint,
      input: { body: { isCompleted }, parameters: { id } },
    }),
  mutationKey: ['todos', 'completion'],
  onMutate: async ({ id, isCompleted }, context) => {
    await context.client.cancelQueries({ queryKey: todoListQueryKey });
    const snapshot = context.client.getQueryData<TodoListResult>(todoListQueryKey);

    context.client.setQueryData<TodoListResult>(todoListQueryKey, (current) =>
      current?.ok === true
        ? {
            ok: true,
            value: current.value.map((todo) => (todo.id === id ? { ...todo, isCompleted } : todo)),
          }
        : current
    );

    return { snapshot };
  },
  onSettled: async (result, _error, _variables, onMutateResult, context) => {
    if (result?.ok !== true) {
      context.client.setQueryData(todoListQueryKey, onMutateResult?.snapshot);
    }

    await context.client.invalidateQueries({ queryKey: todoListQueryKey });
  },
});
