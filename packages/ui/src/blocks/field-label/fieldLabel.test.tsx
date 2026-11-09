import { TextInput } from '@mantine/core';
import { FieldLabel } from '@template/ui/blocks/field-label/FieldLabel';
import { renderWithUi } from '@template/ui/testing/TestRendering';
import { screen } from '@testing-library/react';
import { expect, it } from 'vitest';

it('入力欄のラベルに渡した場合、ラベルの文字で入力欄を見つけられること', () => {
  renderWithUi(
    <TextInput
      label={
        <FieldLabel hint="請求書に載る名前です" hintLabel="取引先名について" label="取引先名" />
      }
    />
  );

  const actual = screen.getByRole('textbox', { name: /取引先名/u });

  expect(actual).toBeInTheDocument();
});

it('ヒントのボタンにフォーカスした場合、ヒントの文を出すこと', async () => {
  renderWithUi(
    <FieldLabel hint="請求書に載る名前です" hintLabel="取引先名について" label="取引先名" />
  );

  screen.getByRole('button', { name: '取引先名について' }).focus();

  const actual = await screen.findByText('請求書に載る名前です');
  expect(actual).toBeInTheDocument();
});
