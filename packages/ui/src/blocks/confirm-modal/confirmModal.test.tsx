import { ConfirmModal } from '@template/ui/blocks/confirm-modal/ConfirmModal';
import { renderWithUi } from '@template/ui/testing/TestRendering';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

const renderConfirmModal = ({
  isConfirming,
  onClose,
  onConfirm,
}: {
  readonly isConfirming: boolean;
  readonly onClose: () => void;
  readonly onConfirm: () => void;
}): void => {
  renderWithUi(
    <ConfirmModal
      closeLabel="キャンセル"
      confirmLabel="削除する"
      description="この操作は取り消せません。"
      isConfirming={isConfirming}
      isDestructive
      isOpened
      onClose={onClose}
      onConfirm={onConfirm}
      summary={[
        { label: '注文番号', value: '#1024' },
        { label: '合計', value: '¥6,036' },
      ]}
      title="注文を削除しますか？"
    />
  );
};

const renderIdleConfirmModal = (): void => {
  renderConfirmModal({
    isConfirming: false,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
  });
};

it('開いた場合、title を名前に持つダイアログを描画すること', async () => {
  renderIdleConfirmModal();

  const actual = await screen.findByRole('dialog', {
    name: '注文を削除しますか？',
  });

  expect(actual).toBeInTheDocument();
});

it('summary を渡した場合、項目名と値を描画すること', async () => {
  renderIdleConfirmModal();

  const actual = await screen.findByText('¥6,036');

  expect(actual).toHaveRole('definition');
});

it('閉じるボタンを押した場合、onClose を呼ぶこと', async () => {
  const onClose = vi.fn();
  renderConfirmModal({ isConfirming: false, onClose, onConfirm: vi.fn() });

  fireEvent.click(await screen.findByRole('button', { name: 'キャンセル' }));

  expect(onClose).toHaveBeenCalledOnce();
});

it('確定ボタンを押した場合、onConfirm を呼ぶこと', async () => {
  const onConfirm = vi.fn();
  renderConfirmModal({ isConfirming: false, onClose: vi.fn(), onConfirm });

  fireEvent.click(await screen.findByRole('button', { name: '削除する' }));

  expect(onConfirm).toHaveBeenCalledOnce();
});

it('開いた場合、最初のフォーカスを閉じるボタンに入れること', async () => {
  renderIdleConfirmModal();

  const closeButton = await screen.findByRole('button', { name: 'キャンセル' });

  await waitFor(() => {
    expect(closeButton).toHaveFocus();
  });
});

it('実行中の場合、確定ボタンを押せないこと', async () => {
  const onConfirm = vi.fn();
  renderConfirmModal({ isConfirming: true, onClose: vi.fn(), onConfirm });

  fireEvent.click(await screen.findByRole('button', { name: '削除する' }));

  expect(onConfirm).not.toHaveBeenCalled();
});

const renderConfirmModalWithDestructive = (isDestructive: boolean): void => {
  renderWithUi(
    <ConfirmModal
      closeLabel="キャンセル"
      confirmLabel="登録する"
      description="注文を登録します。"
      isConfirming={false}
      isDestructive={isDestructive}
      isOpened
      onClose={vi.fn()}
      onConfirm={vi.fn()}
      summary={[]}
      title="注文を登録しますか？"
    />
  );
};

it('破壊的な操作の場合、確定ボタンを入力エラーの色と同じ red.9 で塗ること', async () => {
  renderConfirmModalWithDestructive(true);

  const actual = (await screen.findByRole('button', { name: '登録する' })).getAttribute('style');

  expect(actual).toContain('--mantine-color-red-9');
});

it('破壊的でない操作の場合、確定ボタンをアクセント色で塗ること', async () => {
  renderConfirmModalWithDestructive(false);

  const actual = (await screen.findByRole('button', { name: '登録する' })).getAttribute('style');

  expect(actual).toContain('--mantine-color-accent-filled');
});
