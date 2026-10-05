import { Text } from '@mantine/core';

import classes from '@/shared-components/shimmer-text/ShimmerText.module.css';

// 待ちの一文に光を流し、止まっていないことを伝える
export const ShimmerText = ({
  children,
  size,
}: {
  readonly children: string;
  readonly size: 'sm' | 'xs';
}): React.JSX.Element => (
  <Text className={classes.root} component="span" size={size}>
    {children}
  </Text>
);
