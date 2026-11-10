import { Box, VisuallyHidden } from '@mantine/core';
import { DelayedPending } from '@template/ui/blocks/delayed-pending/DelayedPending';
import classes from '@template/ui/blocks/pending-value/PendingValue.module.css';

// 次の画面へすぐ進み、わかっている値は先に出したうえで、届くのを待つ値だけをその場で光らせる（design-feedback.md）。
// 幅は届く値のおよその文字数で取る
export const PendingValue = ({
  characters,
  label,
}: {
  readonly characters: number;
  readonly label: string;
}): React.JSX.Element => (
  <Box
    aria-busy
    aria-label={label}
    className={classes.root}
    component="span"
    role="status"
    w={`${String(characters)}ch`}
  >
    {/* aria-label はライブリージョンでは読み上げられないことが多いため、同じ文言を画面外の文字でも置く */}
    <VisuallyHidden>{label}</VisuallyHidden>
    <DelayedPending>
      <span aria-hidden className={classes.shimmer} />
    </DelayedPending>
  </Box>
);
