import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { userEvent, within } from 'storybook/test';

import { TodoAddForm } from '@/features/todo-list/internal/todo-add-form/TodoAddForm';

const queryClientDecorator: Decorator = (Story): React.JSX.Element => (
  <QueryClientProvider client={new QueryClient()}>
    <Story />
  </QueryClientProvider>
);

const meta = {
  component: TodoAddForm,
  decorators: [queryClientDecorator],
} satisfies Meta<typeof TodoAddForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ideal: Story = {
  name: '理想状態の場合',
};

// 送信ボタンが押せる状態のコントラストを axe に測らせるため、入力した状態にする（design-states.md）
export const Filled: Story = {
  name: '入力した場合',
  play: async ({ canvasElement }): Promise<void> => {
    await userEvent.type(within(canvasElement).getByRole('textbox', { name: 'Todo' }), '買い物');
  },
};

export const InvalidInput: Story = {
  name: '入力エラーの場合',
  play: async ({ canvasElement }): Promise<void> => {
    await userEvent.click(within(canvasElement).getByRole('textbox', { name: 'Todo' }));
    await userEvent.tab();
  },
};
