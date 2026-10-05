import type { MantineColorShade, MantineColorsTuple } from '@mantine/core';

export type ThemeConfig = {
  readonly accentColors: MantineColorsTuple;
  readonly accentShade: MantineColorShade;
  readonly appearance: 'dark' | 'light';
  readonly fontFamily: string;
  readonly fontFamilyMonospace: string;
  readonly isConfigured: boolean;
  readonly radius: 'lg' | 'md' | 'sm' | 'xl' | 'xs';
  readonly voiceAndTone: 'formal' | 'friendly' | 'standard';
};
