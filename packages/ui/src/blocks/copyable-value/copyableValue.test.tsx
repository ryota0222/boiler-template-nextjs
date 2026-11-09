import { CopyableValue } from '@template/ui/blocks/copyable-value/CopyableValue';
import { renderWithUi } from '@template/ui/testing/TestRendering';
import { fireEvent, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';

const writeText = vi.fn<(text: string) => Promise<void>>();

beforeEach(() => {
  writeText.mockResolvedValue();
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
});

it('コピーのボタンを押した場合、値をクリップボードに書くこと', () => {
  renderWithUi(
    <CopyableValue copiedLabel="コピーしました" copyLabel="注文番号をコピーする" value="ORD-1024" />
  );

  fireEvent.click(screen.getByRole('button', { name: '注文番号をコピーする' }));

  expect(writeText).toHaveBeenCalledWith('ORD-1024');
});

it('コピーした場合、コピーしたことをボタンの横に出すこと', async () => {
  renderWithUi(
    <CopyableValue copiedLabel="コピーしました" copyLabel="注文番号をコピーする" value="ORD-1024" />
  );

  fireEvent.click(screen.getByRole('button', { name: '注文番号をコピーする' }));

  const actual = await screen.findByRole('status');
  expect(actual).toHaveTextContent('コピーしました');
});
