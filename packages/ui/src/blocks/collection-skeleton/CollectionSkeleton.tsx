import { Skeleton, Stack, VisuallyHidden } from '@mantine/core';

// 読み込み後の PageHeader、検索欄、表の行と同じ高さにし、データが届いたときに配置がずれないようにする
const titleHeight = 28;
const titleWidth = 240;
const searchHeight = 36;
const searchWidth = 320;
const rowHeight = 40;

export const CollectionSkeleton = ({
  loadingLabel,
  rowCount,
}: {
  readonly loadingLabel: string;
  readonly rowCount: number;
}): React.JSX.Element => (
  <Stack aria-busy aria-label={loadingLabel} gap="lg" role="status">
    {/* aria-label はライブリージョンでは読み上げられないことが多いため、同じ文言を画面外の文字でも置く */}
    <VisuallyHidden>{loadingLabel}</VisuallyHidden>
    {/* 幅を固定すると、拡大した画面や狭いウィンドウで横にはみ出すため、最大幅だけを決めて縮められるようにする */}
    <Skeleton h={titleHeight} maw={titleWidth} />
    <Skeleton h={searchHeight} maw={searchWidth} />
    <Stack gap="xs">
      {[...Array.from({ length: rowCount }).keys()].map((index) => (
        // 行は並べ替えも増減もしない飾りの要素なので、位置をそのまま key にする
        <Skeleton h={rowHeight} key={index} />
      ))}
    </Stack>
  </Stack>
);
