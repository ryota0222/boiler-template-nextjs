import type { Metadata } from 'next';

import { Container, Title } from '@mantine/core';

export const metadata: Metadata = {
  description: 'テンプレートのトップページ',
  title: 'ホーム | Next.js Template',
};

export default function Page(): React.JSX.Element {
  return (
    <main>
      <Container py="xl">
        <Title order={1} size="h3">
          Next.js Template
        </Title>
      </Container>
    </main>
  );
}
