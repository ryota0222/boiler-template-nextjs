import { Group, Text } from '@mantine/core';

// 大きな数字につく単位は数字の 6 割の大きさにし、数字と単位は文字の下端でそろえる（design-layout.md）
const valueSizes = { lg: 32, md: 24, xl: 48 } as const;
const unitRatio = 0.6;
const unitGap = 4;

export const MetricValue = ({
  size,
  unit,
  value,
}: {
  readonly size: keyof typeof valueSizes;
  readonly unit: null | string;
  readonly value: string;
}): React.JSX.Element => (
  <Group align="baseline" gap={unitGap} wrap="nowrap">
    {/* 桁の幅をそろえ、数が変わっても横に揺れないようにする */}
    <Text
      component="span"
      fw={600}
      fz={valueSizes[size]}
      lh={1}
      style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}
    >
      {value}
    </Text>
    {unit === null ? null : (
      <Text component="span" fz={Math.round(valueSizes[size] * unitRatio)} lh={1}>
        {unit}
      </Text>
    )}
  </Group>
);
