import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { NavigationLinks } from '@template/ui/blocks/navigation-links/NavigationLinks';
import { TestLink } from '@template/ui/testing/TestRendering';

const meta = {
  args: {
    linkComponent: TestLink,
    navigationItems: [
      { href: '/orders', isCurrent: true, label: '注文' },
      { href: '/customers', isCurrent: false, label: '顧客' },
      { href: '/products', isCurrent: false, label: '商品' },
    ],
  },
  component: NavigationLinks,
} satisfies Meta<typeof NavigationLinks>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ideal: Story = {
  name: '理想状態の場合',
};

export const Empty: Story = {
  args: { navigationItems: [] },
  name: '空の場合',
};
