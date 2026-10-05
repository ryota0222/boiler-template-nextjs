import type { Metadata } from 'next';

import { Container, Stack, Title } from '@mantine/core';

import { TodoList } from '@/features/todo-list/TodoList';

export const metadata: Metadata = {
  description: 'Todo の一覧と追加',
  title: 'Todo | Next.js Template',
};

export default function Page(): React.JSX.Element {
  return (
    <main>
      <Container py="xl">
        <Stack gap="lg">
          <Title order={1} size="h3">
            Todo
          </Title>
          <TodoList />
        </Stack>
      </Container>
    </main>
  );
}
