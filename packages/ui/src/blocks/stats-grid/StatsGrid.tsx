import type { ReactNode } from 'react';

import { Paper, SimpleGrid, Text } from '@mantine/core';

const columnsOnSmallScreen = 2;
const columnsOnLargeScreen = 4;

// 項目名と値の組として読み上げられるよう、定義リスト（dl、dt、dd）で組む。
// 値は文字のほか、数と単位の大きさを分ける MetricValue や、読み込み中の Skeleton も受け取る
export const StatsGrid = ({
  stats,
}: {
  readonly stats: readonly {
    readonly label: string;
    readonly note: string;
    readonly value: ReactNode;
  }[];
}): React.JSX.Element => (
  <SimpleGrid
    cols={{ base: 1, lg: columnsOnLargeScreen, sm: columnsOnSmallScreen }}
    component="dl"
    m={0}
  >
    {stats.map((stat) => (
      <Paper key={stat.label} p="md" shadow="xs" withBorder>
        <Text c="dimmed" component="dt" size="xs">
          {stat.label}
        </Text>
        <Text component="dd" fw="bold" fz="h3" m={0}>
          {stat.value}
        </Text>
        <Text component="dd" m={0} size="xs">
          {stat.note}
        </Text>
      </Paper>
    ))}
  </SimpleGrid>
);
