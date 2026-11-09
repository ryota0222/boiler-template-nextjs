import { renderWithUi } from '@template/ui/testing/TestRendering';
import { fireEvent, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

import { ChatComposer } from '@/shared-components/chat-composer/ChatComposer';

const labels = {
  input: 'メッセージ',
  placeholder: '質問を入力',
  send: '送信',
  sending: '送信しています…',
} as const;

it('何も入力していない場合、送信のボタンを押せないこと', () => {
  renderWithUi(<ChatComposer isSending={false} labels={labels} onSend={vi.fn()} />);

  const actual = screen.getByRole('button', { name: '送信' });

  expect(actual).toBeDisabled();
});

it('入力して送信した場合、前後の空白を除いた文を渡して入力欄を空にすること', () => {
  const onSend = vi.fn();
  renderWithUi(<ChatComposer isSending={false} labels={labels} onSend={onSend} />);
  const input = screen.getByRole('textbox', { name: 'メッセージ' });
  fireEvent.change(input, { target: { value: ' 在庫の数を教えて ' } });

  fireEvent.click(screen.getByRole('button', { name: '送信' }));

  expect(onSend).toHaveBeenCalledWith('在庫の数を教えて');
  expect(input).toHaveValue('');
});

it('漢字の変換を確定する Enter の場合、送信しないこと', () => {
  const onSend = vi.fn();
  renderWithUi(<ChatComposer isSending={false} labels={labels} onSend={onSend} />);
  const input = screen.getByRole('textbox', { name: 'メッセージ' });
  fireEvent.change(input, { target: { value: '在庫' } });

  fireEvent.keyDown(input, { isComposing: true, key: 'Enter' });

  expect(onSend).not.toHaveBeenCalled();
});

it('送信している場合、送信している最中であることをボタンの名前にすること', () => {
  renderWithUi(<ChatComposer isSending labels={labels} onSend={vi.fn()} />);

  const actual = screen.getByRole('button', { name: '送信しています…' });

  expect(actual).toBeInTheDocument();
});
