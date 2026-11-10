import { Box, VisuallyHidden } from '@mantine/core';
import { DelayedPending } from '@template/ui/blocks/delayed-pending/DelayedPending';
import classes from '@template/ui/blocks/result-pending/ResultPending.module.css';

// 結果が出る場所の高さを先に取って帯を流し、結果が届いたときに配置が動かないようにする（design-feedback.md）
export const ResultPending = ({
  height,
  label,
}: {
  readonly height: number;
  readonly label: string;
}): React.JSX.Element => (
  <Box aria-busy aria-label={label} h={height} role="status">
    {/* aria-label はライブリージョンでは読み上げられないことが多いため、同じ文言を画面外の文字でも置く */}
    <VisuallyHidden>{label}</VisuallyHidden>
    <DelayedPending>
      <div aria-hidden className={classes.band} />
    </DelayedPending>
  </Box>
);
