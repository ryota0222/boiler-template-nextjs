import type { ReactNode } from 'react';

import { Card, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core';

const columnsOnLargeScreen = 2;

// 項目名と値の組として読み上げられるよう、定義リスト（dl、dt、dd）で組む
export const DetailCard = ({
  action,
  items,
  title,
}: {
  readonly action: ReactNode;
  readonly items: readonly {
    readonly label: string;
    readonly value: ReactNode;
  }[];
  readonly title: string;
}): React.JSX.Element => (
  <Card padding="md" shadow="xs" withBorder>
    <Stack gap="md">
      <Group justify="space-between">
        <Title order={2} size="h5">
          {title}
        </Title>
        {action}
      </Group>
      <SimpleGrid cols={{ base: 1, sm: columnsOnLargeScreen }} component="dl" m={0} spacing="md">
        {items.map((item) => (
          <Stack gap={0} key={item.label}>
            <Text c="dimmed" component="dt" size="xs">
              {item.label}
            </Text>
            <Text component="dd" m={0} size="sm">
              {item.value}
            </Text>
          </Stack>
        ))}
      </SimpleGrid>
    </Stack>
  </Card>
);
