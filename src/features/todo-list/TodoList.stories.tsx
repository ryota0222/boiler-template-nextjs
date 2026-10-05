import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import type { ApiFailure } from '@/entities/apiFailure';
import type { Result } from '@/entities/result';
import type { Todo } from '@/entities/todo';

import { todoListQueryKey } from '@/api/todo/queries';
import { TodoList } from '@/features/todo-list/TodoList';

const todos: readonly Todo[] = [
  {
    createdAt: '2026-10-05T00:00:00.000Z',
    id: '0b7f4e59-1f2a-4d4f-9a39-3e0b8f2a6c11',
    isCompleted: false,
    title: '買い物',
  },
  {
    createdAt: '2026-10-05T01:00:00.000Z',
    id: '6d1f0c2e-3b5a-4e8f-8c71-2a9d4b6e1f30',
    isCompleted: true,
    title: '請求書を送る',
  },
];

const createQueryClientDecorator = (
  todosResult: null | Result<readonly Todo[], ApiFailure>
): Decorator => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { enabled: false } } });
  if (todosResult !== null) {
    queryClient.setQueryData(todoListQueryKey, todosResult);
  }

  return (Story): React.JSX.Element => (
    <QueryClientProvider client={queryClient}>
      <Story />
    </QueryClientProvider>
  );
};

const meta = {
  component: TodoList,
  decorators: [createQueryClientDecorator({ ok: true, value: todos })],
} satisfies Meta<typeof TodoList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ideal: Story = {
  name: '理想状態の場合',
};

export const Empty: Story = {
  decorators: [createQueryClientDecorator({ ok: true, value: [] })],
  name: '空の場合',
};

export const Loading: Story = {
  decorators: [createQueryClientDecorator(null)],
  name: '読み込み中の場合',
};

export const Error: Story = {
  decorators: [
    createQueryClientDecorator({
      error: { kind: 'internal', message: 'Todo の一覧を読めませんでした' },
      ok: false,
    }),
  ],
  name: 'エラーの場合',
};
