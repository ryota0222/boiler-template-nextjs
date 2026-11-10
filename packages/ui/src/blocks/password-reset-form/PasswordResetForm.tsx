'use client';

import type { MagicLinkFormLabels } from '@template/ui/blocks/magic-link-form/MagicLinkForm';
import type { AuthSubmitResult } from '@template/ui/types/authSubmitResult';
import type { LinkComponent } from '@template/ui/types/linkComponent';

import { Anchor, Group } from '@mantine/core';
import { MagicLinkForm } from '@template/ui/blocks/magic-link-form/MagicLinkForm';

// パスワードを設定し直すリンクをメールで送るフォーム。送る流れはログインのリンクと同じなので MagicLinkForm に任せ、
// 下にログインへ戻るリンクを足す
export const PasswordResetForm = ({
  backToLoginLabel,
  labels,
  linkComponent,
  loginHref,
  onSubmit,
}: {
  readonly backToLoginLabel: string;
  readonly labels: MagicLinkFormLabels;
  readonly linkComponent: LinkComponent;
  readonly loginHref: string;
  readonly onSubmit: (email: string) => Promise<AuthSubmitResult>;
}): React.JSX.Element => (
  <MagicLinkForm
    footer={
      <Group justify="center">
        <Anchor component={linkComponent} href={loginHref} size="sm">
          {backToLoginLabel}
        </Anchor>
      </Group>
    }
    labels={labels}
    onSubmit={onSubmit}
  />
);
