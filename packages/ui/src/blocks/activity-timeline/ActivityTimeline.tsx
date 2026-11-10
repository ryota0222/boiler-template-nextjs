import type { ReactNode } from 'react';

import { Text, Timeline, TimelineItem } from '@mantine/core';
import { RelativeTime } from '@template/ui/blocks/relative-time/RelativeTime';

const bulletSize = 12;
const lineWidth = 2;

export type ActivityTimelineItem = {
  readonly at: Date;
  readonly detail: null | ReactNode;
  readonly id: string;
  // 誰が何をしたかを 1 文で書く（例：山田 太郎が状態を確認済みにしました）
  readonly title: string;
};

// レコードの履歴を新しいものから並べ、いつかは RelativeTime で出す。並べる順は呼ぶ側が決める
export const ActivityTimeline = ({
  items,
  label,
  now,
}: {
  readonly items: readonly ActivityTimelineItem[];
  readonly label: string;
  readonly now: Date;
}): React.JSX.Element => (
  <Timeline aria-label={label} bulletSize={bulletSize} component="ol" lineWidth={lineWidth}>
    {items.map((item) => (
      <TimelineItem component="li" key={item.id} title={<Text size="sm">{item.title}</Text>}>
        {item.detail === null ? null : (
          <Text c="dimmed" component="div" size="sm">
            {item.detail}
          </Text>
        )}
        <RelativeTime now={now} value={item.at} />
      </TimelineItem>
    ))}
  </Timeline>
);
