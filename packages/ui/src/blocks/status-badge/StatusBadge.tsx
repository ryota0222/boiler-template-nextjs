import { Badge } from '@mantine/core';
import {
  IconAlertTriangleFilled,
  IconCircleArrowRightFilled,
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconClockFilled,
  IconHourglassFilled,
} from '@tabler/icons-react';

const iconSize = 12;

// 状態を色だけで伝えないよう、状態の種類ごとに形の違う塗りのアイコンを決める（design-icon.md）。
// 成功・警告の色は文字に使えないため、色はアイコンだけに付けて文字は既定の色のままにする（design-a11y.md）
const statusTones = {
  attention: {
    color: 'var(--mantine-color-orange-9)',
    Icon: IconAlertTriangleFilled,
  },
  awaiting: {
    color: 'var(--mantine-primary-color-filled)',
    Icon: IconCircleArrowRightFilled,
  },
  done: { color: 'var(--mantine-color-green-9)', Icon: IconCircleCheckFilled },
  failed: { color: 'var(--mantine-color-red-9)', Icon: IconCircleXFilled },
  processing: {
    color: 'var(--mantine-color-gray-6)',
    Icon: IconHourglassFilled,
  },
  queued: { color: 'var(--mantine-color-gray-6)', Icon: IconClockFilled },
} as const;

export type StatusTone = keyof typeof statusTones;

export const StatusBadge = ({
  children,
  size,
  tone,
}: {
  readonly children: React.ReactNode;
  readonly size: 'md' | 'sm';
  readonly tone: StatusTone;
}): React.JSX.Element => {
  const { color, Icon } = statusTones[tone];

  return (
    // 長い名前の横に並んでも縮まず、縦に並べても行いっぱいに伸びないよう、幅を文言に合わせて固定する
    <Badge
      flex="none"
      leftSection={<Icon aria-hidden color={color} size={iconSize} />}
      size={size}
      variant="default"
      w="fit-content"
    >
      {children}
    </Badge>
  );
};
