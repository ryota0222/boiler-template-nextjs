import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { TextInput } from '@mantine/core';
import { FieldLabel } from '@template/ui/blocks/field-label/FieldLabel';
import { expect, userEvent, waitFor, within } from 'storybook/test';

const meta = {
  args: {
    hint: '請求書に載る名前です。登記の名前と違う場合はこちらを優先します',
    hintLabel: '取引先名について',
    label: '取引先名',
  },
  component: FieldLabel,
  render: ({ hint, hintLabel, label }) => (
    <TextInput label={<FieldLabel hint={hint} hintLabel={hintLabel} label={label} />} required />
  ),
} satisfies Meta<typeof FieldLabel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ideal: Story = {
  name: '理想状態の場合',
};

export const Opened: Story = {
  name: '開いた場合',
  play: async ({ canvasElement }): Promise<void> => {
    await userEvent.hover(within(canvasElement).getByRole('button', { name: '取引先名について' }));
    const tooltip = await within(canvasElement.ownerDocument.body).findByRole('tooltip');
    await waitFor(async () => {
      await expect(getComputedStyle(tooltip).opacity).toBe('1');
    });
  },
};
