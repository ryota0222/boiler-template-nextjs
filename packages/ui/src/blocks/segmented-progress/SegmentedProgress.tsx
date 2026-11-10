import { Group, Progress, Stack, Text } from '@mantine/core';

// 8 個までは区切りのある棒で 1 個ずつ見せ、それより多いと区切りが細かすぎて読めないため 1 本の棒にする。
// 1 個しかない作業は進み具合を見せる意味がないため出さない
const maxSegments = 8;
const barHeight = 6;
const segmentGap = 4;
const percent = 100;

export const SegmentedProgress = ({
  done,
  label,
  total,
}: {
  readonly done: number;
  readonly label: string;
  readonly total: number;
}): null | React.JSX.Element => {
  if (total <= 1) {
    return null;
  }

  return (
    <Stack gap="xs">
      <Text size="sm">
        {label}{' '}
        <Text component="span" fw={700} style={{ fontVariantNumeric: 'tabular-nums' }}>
          {done}
        </Text>{' '}
        / {total}
      </Text>
      {total <= maxSegments ? (
        <Group
          aria-label={label}
          aria-valuemax={total}
          aria-valuemin={0}
          aria-valuenow={done}
          gap={segmentGap}
          grow
          role="progressbar"
          wrap="nowrap"
        >
          {[...Array.from({ length: total }).keys()].map((index) => (
            // 区切りは並べ替えも増減もしない飾りの要素なので、位置をそのまま key にする。
            // 1 区切りずつ Progress で描き、明るい画面と暗い画面の色を Mantine にそろえる
            <Progress aria-hidden key={index} size={barHeight} value={index < done ? percent : 0} />
          ))}
        </Group>
      ) : (
        <Progress
          aria-label={label}
          size={barHeight}
          value={Math.round((done / total) * percent)}
        />
      )}
    </Stack>
  );
};
