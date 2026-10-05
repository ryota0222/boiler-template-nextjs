'use client';

import type { UseQueryResult } from '@tanstack/react-query';

import { Checkbox, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CollectionSkeleton } from '@template/ui/blocks/collection-skeleton/CollectionSkeleton';
import { EmptyCollection } from '@template/ui/blocks/empty-collection/EmptyCollection';
import { ErrorBanner } from '@template/ui/blocks/error-banner/ErrorBanner';
import { isDefined } from 'remeda';

import type { ApiFailure } from '@/entities/apiFailure';
import type { Result } from '@/entities/result';
import type { Todo } from '@/entities/todo';

import { todoCompletionMutationOptions } from '@/api/todo/mutations';
import { todoListQueryOptions } from '@/api/todo/queries';
import { TodoAddForm } from '@/features/todo-list/internal/todo-add-form/TodoAddForm';

const skeletonRowCount = 3;

const renderTodos = ({
  onCompletionChange,
  todos,
}: {
  readonly onCompletionChange: (change: {
    readonly id: string;
    readonly isCompleted: boolean;
  }) => void;
  readonly todos: readonly Todo[];
}): React.JSX.Element =>
  todos.length === 0 ? (
    <EmptyCollection
      empty={{
        action: null,
        description: '上の入力欄から最初の Todo を追加できます。',
        title: 'Todo はまだありません',
      }}
      filtered={null}
    />
  ) : (
    <Stack aria-label="Todo の一覧" component="ul" gap="xs">
      {todos.map((todo) => (
        <li key={todo.id}>
          <Checkbox
            checked={todo.isCompleted}
            label={todo.title}
            onChange={(event) => {
              onCompletionChange({ id: todo.id, isCompleted: event.currentTarget.checked });
            }}
            size="md"
          />
        </li>
      ))}
    </Stack>
  );

const renderContent = ({
  onCompletionChange,
  todosQuery,
}: {
  readonly onCompletionChange: (change: {
    readonly id: string;
    readonly isCompleted: boolean;
  }) => void;
  readonly todosQuery: UseQueryResult<Result<readonly Todo[], ApiFailure>>;
}): React.JSX.Element => {
  if (!isDefined(todosQuery.data)) {
    return (
      <CollectionSkeleton loadingLabel="Todo の一覧を読み込み中" rowCount={skeletonRowCount} />
    );
  }

  if (!todosQuery.data.ok) {
    return (
      <ErrorBanner
        description="時間をおいてから、もう一度読み込んでください。"
        onRetry={() => {
          void todosQuery.refetch();
        }}
        retryLabel="もう一度読み込む"
        title="Todo の一覧を読み込めませんでした"
      />
    );
  }

  return renderTodos({ onCompletionChange, todos: todosQuery.data.value });
};

// 完了の切り替えは楽観的に先に画面へ反映するため、失敗して元に戻したときは通知で理由を伝える（state-management.md）。
// requestEndpoint は失敗を例外ではなく Result で返すため、失敗はいつも onSuccess に届く
const notifyCompletionFailure = (message: string): void => {
  notifications.show({ color: 'red', message, title: 'Todo を更新できませんでした' });
};

export const TodoList = (): React.JSX.Element => {
  const todosQuery = useQuery(todoListQueryOptions);
  const completionMutation = useMutation(todoCompletionMutationOptions);

  return (
    <Stack gap="lg">
      <TodoAddForm />
      {renderContent({
        onCompletionChange: (change) => {
          completionMutation.mutate(change, {
            onSuccess: (result) => {
              if (!result.ok) {
                notifyCompletionFailure(result.error.message);
              }
            },
          });
        },
        todosQuery,
      })}
    </Stack>
  );
};
