import type { BadgeFactory, MantineThemeOverride, PartialVarsResolver } from '@mantine/core';
import type { ThemeConfig } from '@template/ui/theme/themeConfig';

import { Badge, createTheme, Notification, rem } from '@mantine/core';

// Mantine の md の Badge は高さ 20px で、文字の上下に余白がなく詰まって見えるため、
// md のときだけ高さを 24px にして上下に 4px ずつの余白を作る（Figma「Mantine UI（テンプレート）」の Badge）
const badgeHeightMdPx = 24;
export const badgeHeightMd = rem(badgeHeightMdPx);

export const resolveBadgeVariables: PartialVarsResolver<BadgeFactory> = (_theme, properties) =>
  properties.size === undefined || properties.size === 'md'
    ? { root: { '--badge-height': badgeHeightMd } }
    : { root: {} };

const notificationIconSizePx = 20;
const notificationIconSize = rem(notificationIconSizePx);

// Mantine の既定の色名と衝突させず、アプリごとのアクセント色を 1 つの名前で参照するため
export const accentColorName = 'accent';

export const createAppTheme = (themeConfig: ThemeConfig): MantineThemeOverride =>
  createTheme({
    colors: { [accentColorName]: themeConfig.accentColors },
    components: {
      // Mantine の Anchor は既定でホバーのときだけ下線が付き、止まっているリンクが色だけで示されるため、
      // 常に下線を付ける（design-affordance.md）
      Anchor: { defaultProps: { underline: 'always' } },
      Badge: Badge.extend({ vars: resolveBadgeVariables }),
      // Paper の影は CSS 変数で付くため、外側の面に付けた shadow が中の Card・Paper へ引き継がれる。
      // 中の面に影が重ならないよう、既定で影なしを明示する（design-surface.md）
      Card: { defaultProps: { shadow: 'none' } },
      // Mantine の Notification は icon を色の丸の中に白で描くため、Alert と同じく線のアイコンを色そのもので描く。
      // icon を渡すと左の色の帯は消え、色の意味はアイコンの形と色が伝える（design-feedback.md）
      Notification: Notification.extend({
        styles: {
          icon: {
            backgroundColor: 'transparent',
            color: 'var(--notification-color)',
            height: notificationIconSize,
            marginInlineEnd: 'var(--mantine-spacing-sm)',
            width: notificationIconSize,
          },
        },
      }),
      Paper: { defaultProps: { shadow: 'none' } },
      // Mantine の既定（上下 7px・左右 10px）では行が詰まり、見出しと中身の文字が線に近づきすぎるため、
      // 上下を spacing.sm（12px）、左右を spacing.md（16px）に広げる（Figma「Mantine UI（テンプレート）」の Table/Row）
      Table: { defaultProps: { horizontalSpacing: 'md', verticalSpacing: 'sm' } },
    },
    defaultRadius: themeConfig.radius,
    fontFamily: themeConfig.fontFamily,
    fontFamilyMonospace: themeConfig.fontFamilyMonospace,
    primaryColor: accentColorName,
    primaryShade: themeConfig.accentShade,
    // Mantine の既定は false で、OS の動きを減らす設定を無視してアニメーションするため
    respectReducedMotion: true,
  });
