import type { Metadata } from 'next';

import { Container, Heading } from '@radix-ui/themes';

export const metadata: Metadata = {
  description: 'テンプレートのトップページ',
  title: 'ホーム | Next.js Template',
};

export default function Page(): React.JSX.Element {
  return (
    <main>
      <Container>
        <Heading as="h1">Next.js Template</Heading>
      </Container>
    </main>
  );
}
