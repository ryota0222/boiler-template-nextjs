import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Mail } from 'lucide-react';

import { Button } from '@/shared-components/shadcn/button/Button';

const meta = {
  component: Button,
  title: 'shared-components/shadcn/Button',
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const VariantDefault: Story = {
  args: {
    children: 'ボタン',
    variant: 'default',
  },
  name: 'variantがdefaultの場合',
};

export const VariantSecondary: Story = {
  args: {
    children: 'ボタン',
    variant: 'secondary',
  },
  name: 'variantがsecondaryの場合',
};

export const VariantDestructive: Story = {
  args: {
    children: '削除',
    variant: 'destructive',
  },
  name: 'variantがdestructiveの場合',
};

export const VariantOutline: Story = {
  args: {
    children: 'ボタン',
    variant: 'outline',
  },
  name: 'variantがoutlineの場合',
};

export const VariantGhost: Story = {
  args: {
    children: 'ボタン',
    variant: 'ghost',
  },
  name: 'variantがghostの場合',
};

export const VariantLink: Story = {
  args: {
    children: 'リンク',
    variant: 'link',
  },
  name: 'variantがlinkの場合',
};

export const SizeDefault: Story = {
  args: {
    children: 'ボタン',
    size: 'default',
  },
  name: 'sizeがdefaultの場合',
};

export const SizeLarge: Story = {
  args: {
    children: 'ボタン',
    size: 'lg',
  },
  name: 'sizeがlgの場合',
};

export const SizeSmall: Story = {
  args: {
    children: 'ボタン',
    size: 'sm',
  },
  name: 'sizeがsmの場合',
};

export const SizeExtraSmall: Story = {
  args: {
    children: 'ボタン',
    size: 'xs',
  },
  name: 'sizeがxsの場合',
};

export const SizeIcon: Story = {
  args: {
    'aria-label': 'メールを送信',
    children: <Mail />,
    size: 'icon',
  },
  name: 'sizeがiconの場合',
};

export const SizeIconLarge: Story = {
  args: {
    'aria-label': 'メールを送信',
    children: <Mail />,
    size: 'icon-lg',
  },
  name: 'sizeがicon-lgの場合',
};

export const SizeIconSmall: Story = {
  args: {
    'aria-label': 'メールを送信',
    children: <Mail />,
    size: 'icon-sm',
  },
  name: 'sizeがicon-smの場合',
};

export const SizeIconExtraSmall: Story = {
  args: {
    'aria-label': 'メールを送信',
    children: <Mail />,
    size: 'icon-xs',
  },
  name: 'sizeがicon-xsの場合',
};

export const Disabled: Story = {
  args: {
    children: 'ボタン',
    disabled: true,
  },
  name: 'disabledがtrueの場合',
};

export const DisabledDestructive: Story = {
  args: {
    children: '削除',
    disabled: true,
    variant: 'destructive',
  },
  name: 'disabledがtrueかつvariantがdestructiveの場合',
};
