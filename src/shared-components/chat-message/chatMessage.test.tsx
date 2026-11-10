import { renderWithUi } from '@template/ui/testing/TestRendering';
import { screen } from '@testing-library/react';
import { expect, it } from 'vitest';

import { ChatMessage } from '@/shared-components/chat-message/ChatMessage';

it('話し手を渡した場合、話し手の名前を読み上げ用に本文の前へ置くこと', () => {
  renderWithUi(
    <ChatMessage isWriting={false} speaker="user" speakerLabel="あなた">
      在庫の数を教えて
    </ChatMessage>
  );

  const actual = screen.getByText('あなた').parentElement;

  expect(actual).toHaveTextContent('あなた在庫の数を教えて');
});

it('AI が返答を書いている場合、印の代わりにオーブを置くこと', () => {
  const { container } = renderWithUi(
    <ChatMessage isWriting speaker="assistant" speakerLabel="AI">
      調べています
    </ChatMessage>
  );

  const actual = container.querySelector('canvas');

  expect(actual).toBeInTheDocument();
});
