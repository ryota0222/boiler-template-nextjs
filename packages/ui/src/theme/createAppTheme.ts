import type { MantineThemeOverride } from '@mantine/core';
import type { ThemeConfig } from '@template/ui/theme/themeConfig';

import { createTheme } from '@mantine/core';

// Mantine の既定の色名と衝突させず、アプリごとのアクセント色を 1 つの名前で参照するため
export const accentColorName = 'accent';

export const createAppTheme = (themeConfig: ThemeConfig): MantineThemeOverride =>
  createTheme({
    colors: { [accentColorName]: themeConfig.accentColors },
    // Paper の影は CSS 変数で付くため、外側の面に付けた shadow が中の Card・Paper へ引き継がれる。
    // 中の面に影が重ならないよう、既定で影なしを明示する（design-surface.md）
    components: {
      Card: { defaultProps: { shadow: 'none' } },
      Paper: { defaultProps: { shadow: 'none' } },
    },
    defaultRadius: themeConfig.radius,
    fontFamily: themeConfig.fontFamily,
    fontFamilyMonospace: themeConfig.fontFamilyMonospace,
    primaryColor: accentColorName,
    primaryShade: themeConfig.accentShade,
    // Mantine の既定は false で、OS の動きを減らす設定を無視してアニメーションするため
    respectReducedMotion: true,
  });
