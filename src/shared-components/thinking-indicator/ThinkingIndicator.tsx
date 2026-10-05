'use client';

import { Group } from '@mantine/core';

import { ShimmerText } from '@/shared-components/shimmer-text/ShimmerText';
import { ThinkingOrbIcon } from '@/shared-components/thinking-orb-icon/ThinkingOrbIcon';

export const ThinkingIndicator = ({ label }: { readonly label: string }): React.JSX.Element => (
  <Group gap="xs" wrap="nowrap">
    <ThinkingOrbIcon size="inline" />
    <ShimmerText size="sm">{label}</ShimmerText>
  </Group>
);
