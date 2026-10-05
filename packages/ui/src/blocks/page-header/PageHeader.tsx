import type { LinkComponent } from '@template/ui/types/linkComponent';
import type { ReactNode } from 'react';

import { Anchor, Box, Breadcrumbs, Group, Stack, Text, Title } from '@mantine/core';

export const PageHeader = ({
  breadcrumbs,
  breadcrumbsLabel,
  linkComponent,
  note,
  primaryAction,
  title,
}: {
  readonly breadcrumbs: readonly {
    readonly href: string;
    readonly label: string;
  }[];
  readonly breadcrumbsLabel: string;
  readonly linkComponent: LinkComponent;
  readonly note: ReactNode;
  readonly primaryAction: ReactNode;
  readonly title: string;
}): React.JSX.Element => (
  <Stack gap="xs">
    {/* 最上位の階層では、パンくずが見出しと同じ名前を繰り返すだけになるため出さない（design-layout.md） */}
    {breadcrumbs.length > 0 && (
      <Box aria-label={breadcrumbsLabel} component="nav">
        <Breadcrumbs
          separator={<span aria-hidden>/</span>}
          // Mantine は項目を折り返さないため、長いページ名が画面の幅からはみ出して横に流れる（design-a11y.md）
          styles={{
            breadcrumb: {
              lineHeight: 'var(--mantine-line-height-sm)',
              overflowWrap: 'anywhere',
              whiteSpace: 'normal',
            },
          }}
        >
          {breadcrumbs.map((breadcrumb) => (
            <Anchor
              component={linkComponent}
              href={breadcrumb.href}
              key={breadcrumb.href}
              size="sm"
              underline="always"
            >
              {breadcrumb.label}
            </Anchor>
          ))}
          <Text aria-current="page" size="sm">
            {title}
          </Text>
        </Breadcrumbs>
      </Box>
    )}
    <Group align="flex-start" justify="space-between">
      <Stack gap="xs">
        <Title order={1} size="h3">
          {title}
        </Title>
        {note}
      </Stack>
      {primaryAction}
    </Group>
  </Stack>
);
