import { Button, Image, Stack } from '@mantine/core';

const logoSize = 18;
const buttonHeight = 40;

export type SSOProvider = {
  readonly id: string;
  // 各社のガイドラインに沿った文言にする（例：Google でログイン、Microsoft アカウントでサインイン）
  readonly label: string;
  // 各社が配る公式のロゴの SVG。描き起こしたロゴや 1 色のアイコンは使わない（design-recipes.md）
  readonly logoSrc: string;
  readonly onClick: () => void;
};

// 外部のアカウントでログインするボタンを並べる。各社のボタンは同じ大きさと重さにそろえ、どれかを目立たせない。
// Google の決まりに合わせ、白い面に灰色の線（#747775）を引く。この色はブランドの決まりなのでテーマの色に置き換えない
export const SSOButtons = ({
  pendingProviderId,
  providers,
}: {
  readonly pendingProviderId: null | string;
  readonly providers: readonly SSOProvider[];
}): React.JSX.Element => (
  <Stack gap="sm">
    {providers.map((provider) => (
      <Button
        color="dark"
        disabled={pendingProviderId !== null}
        fullWidth
        h={buttonHeight}
        key={provider.id}
        leftSection={<Image alt="" h={logoSize} src={provider.logoSrc} w={logoSize} />}
        loading={pendingProviderId === provider.id}
        onClick={provider.onClick}
        styles={{ root: { backgroundColor: '#ffffff', borderColor: '#747775' } }}
        variant="default"
      >
        {provider.label}
      </Button>
    ))}
  </Stack>
);
