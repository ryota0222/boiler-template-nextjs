'use client';

import type { ThemeConfig } from '@template/ui/theme/themeConfig';
import type { ReactNode } from 'react';

import { MantineProvider } from '@mantine/core';
import { createAppTheme } from '@template/ui/theme/createAppTheme';
import { resolveCssVariables } from '@template/ui/theme/resolveCssVariables';

export const UiProvider = ({
  children,
  themeConfig,
}: {
  readonly children: ReactNode;
  readonly themeConfig: ThemeConfig;
}): React.JSX.Element => (
  <MantineProvider
    cssVariablesResolver={resolveCssVariables}
    forceColorScheme={themeConfig.appearance}
    theme={createAppTheme(themeConfig)}
  >
    {children}
  </MantineProvider>
);
