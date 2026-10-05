import { TextInput } from '@mantine/core';
import { FormCard } from '@template/ui/blocks/form-card/FormCard';
import { renderWithUi } from '@template/ui/testing/TestRendering';
import { fireEvent, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

const renderFormCard = ({
  isDirty,
  isSubmitting,
  isValid,
  onCancel,
  onSubmit,
  requiresConfirmation,
}: {
  readonly isDirty: boolean;
  readonly isSubmitting: boolean;
  readonly isValid: boolean;
  readonly onCancel: () => void;
  readonly onSubmit: () => void;
  readonly requiresConfirmation: boolean;
}): void => {
  renderWithUi(
    <FormCard
      cancelLabel="編集をやめる"
      isDirty={isDirty}
      isSubmitting={isSubmitting}
      isValid={isValid}
      onCancel={onCancel}
      onSubmit={onSubmit}
      requiresConfirmation={requiresConfirmation}
      statusMessages={{
        changed: '変更があります',
        invalid: '入力に誤りがあります。赤い説明の項目を直してください',
        submitting: '保存しています',
        unchanged: '変更はまだありません',
      }}
      submitLabel="保存する"
      submittingLabel="保存中…"
      title="配送先"
    >
      <TextInput label="住所" />
    </FormCard>
  );
};

const renderWithState = ({
  isDirty,
  isValid,
}: {
  readonly isDirty: boolean;
  readonly isValid: boolean;
}): void => {
  renderFormCard({
    isDirty,
    isSubmitting: false,
    isValid,
    onCancel: vi.fn(),
    onSubmit: vi.fn(),
    requiresConfirmation: false,
  });
};

it('見出しを渡した場合、カードの見出しとして描画すること', () => {
  renderWithState({ isDirty: false, isValid: true });

  const actual = screen.getByRole('heading', { level: 2 });

  expect(actual).toHaveTextContent('配送先');
});

it('入力欄を渡した場合、フォームの中に描画すること', () => {
  renderWithState({ isDirty: false, isValid: true });

  const actual = screen.getByRole('textbox', { name: '住所' }).closest('form');

  expect(actual).toBeInTheDocument();
});

it('変更がない場合、送信ボタンを押せないこと', () => {
  renderWithState({ isDirty: false, isValid: true });

  const actual = screen.getByRole('button', { name: '保存する' });

  expect(actual).toBeDisabled();
});

it('変更がない場合、変更がないことを説明すること', () => {
  renderWithState({ isDirty: false, isValid: true });

  const actual = screen.getByRole('status');

  expect(actual).toHaveTextContent('変更はまだありません');
});

it('入力に誤りがある場合、送信ボタンを押せないこと', () => {
  renderWithState({ isDirty: true, isValid: false });

  const actual = screen.getByRole('button', { name: '保存する' });

  expect(actual).toBeDisabled();
});

it('入力に誤りがある場合、直す項目を説明すること', () => {
  renderWithState({ isDirty: true, isValid: false });

  const actual = screen.getByRole('status');

  expect(actual).toHaveTextContent('入力に誤りがあります');
});

it('変更があり入力が正しい場合、送信ボタンを押せること', () => {
  renderWithState({ isDirty: true, isValid: true });

  const actual = screen.getByRole('button', { name: '保存する' });

  expect(actual).toBeEnabled();
});

it('変更があり入力が正しい場合、変更があることを説明すること', () => {
  renderWithState({ isDirty: true, isValid: true });

  const actual = screen.getByRole('status');

  expect(actual).toHaveTextContent('変更があります');
});

it('送信した場合、onSubmit を呼ぶこと', () => {
  const onSubmit = vi.fn();
  renderFormCard({
    isDirty: true,
    isSubmitting: false,
    isValid: true,
    onCancel: vi.fn(),
    onSubmit,
    requiresConfirmation: false,
  });

  fireEvent.click(screen.getByRole('button', { name: '保存する' }));

  expect(onSubmit).toHaveBeenCalledOnce();
});

it('取り消した場合、onCancel を呼ぶこと', () => {
  const onCancel = vi.fn();
  renderFormCard({
    isDirty: true,
    isSubmitting: false,
    isValid: true,
    onCancel,
    onSubmit: vi.fn(),
    requiresConfirmation: false,
  });

  fireEvent.click(screen.getByRole('button', { name: '編集をやめる' }));

  expect(onCancel).toHaveBeenCalledOnce();
});

it('送信中の場合、送信ボタンを押しても onSubmit を呼ばないこと', () => {
  const onSubmit = vi.fn();
  renderFormCard({
    isDirty: true,
    isSubmitting: true,
    isValid: true,
    onCancel: vi.fn(),
    onSubmit,
    requiresConfirmation: false,
  });

  fireEvent.click(screen.getByRole('button', { name: '保存中…' }));

  expect(onSubmit).not.toHaveBeenCalled();
});

it('送信中の場合、送信ボタンの文言を進行形にすること', () => {
  renderFormCard({
    isDirty: true,
    isSubmitting: true,
    isValid: true,
    onCancel: vi.fn(),
    onSubmit: vi.fn(),
    requiresConfirmation: false,
  });

  const actual = screen.getByRole('button', { name: '保存中…' });

  expect(actual).toBeInTheDocument();
});

it('送信中の場合、送信していることを説明すること', () => {
  renderFormCard({
    isDirty: true,
    isSubmitting: true,
    isValid: true,
    onCancel: vi.fn(),
    onSubmit: vi.fn(),
    requiresConfirmation: false,
  });

  const actual = screen.getByRole('status');

  expect(actual).toHaveTextContent('保存しています');
});

it('確認を挟む送信の場合、入力欄で Enter を押しても onSubmit を呼ばないこと', () => {
  const onSubmit = vi.fn();
  renderFormCard({
    isDirty: true,
    isSubmitting: false,
    isValid: true,
    onCancel: vi.fn(),
    onSubmit,
    requiresConfirmation: true,
  });

  fireEvent.submit(screen.getByRole('textbox', { name: '住所' }));

  expect(onSubmit).not.toHaveBeenCalled();
});

it('確認を挟む送信の場合、送信ボタンを押すと onSubmit を呼ぶこと', () => {
  const onSubmit = vi.fn();
  renderFormCard({
    isDirty: true,
    isSubmitting: false,
    isValid: true,
    onCancel: vi.fn(),
    onSubmit,
    requiresConfirmation: true,
  });

  fireEvent.click(screen.getByRole('button', { name: '保存する' }));

  expect(onSubmit).toHaveBeenCalledOnce();
});

it('確認を挟まない送信の場合、入力欄で Enter を押すと onSubmit を呼ぶこと', () => {
  const onSubmit = vi.fn();
  renderFormCard({
    isDirty: true,
    isSubmitting: false,
    isValid: true,
    onCancel: vi.fn(),
    onSubmit,
    requiresConfirmation: false,
  });

  fireEvent.submit(screen.getByRole('textbox', { name: '住所' }));

  expect(onSubmit).toHaveBeenCalledOnce();
});

it('取り消しと送信が 2 行に分かれる幅の場合も、送信ボタンを右に寄せること', () => {
  renderWithState({ isDirty: true, isValid: true });

  const actual = screen.getByRole('status').parentElement;

  expect(actual).toHaveStyle({ marginLeft: 'auto' });
});

it('状態の説明が長く送信ボタンが次の行に回る場合も、送信ボタンを右に寄せること', () => {
  renderWithState({ isDirty: true, isValid: false });

  const actual = screen.getByRole('status').parentElement?.getAttribute('style');

  // Mantine の Group は寄せ方を CSS 変数の --group-justify で持つ
  expect(actual).toContain('--group-justify: flex-end');
});
