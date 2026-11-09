import { InlineEdit } from '@template/ui/blocks/inline-edit/InlineEdit';
import { renderWithUi } from '@template/ui/testing/TestRendering';
import { fireEvent, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

const labels = {
  cancel: 'やめる',
  edit: '直す',
  save: '保存する',
  saved: '保存しました',
  saving: '保存しています…',
} as const;

it('直すボタンを押した場合、今の値を入れた入力欄を出すこと', () => {
  renderWithUi(
    <InlineEdit label="取引先名" labels={labels} onSave={vi.fn()} value="株式会社サンプル" />
  );

  fireEvent.click(screen.getByRole('button', { name: '直す' }));

  const actual = screen.getByRole('textbox', { name: '取引先名' });
  expect(actual).toHaveValue('株式会社サンプル');
});

it('保存に成功した場合、保存したことを値の横に出すこと', async () => {
  const onSave = vi.fn().mockResolvedValue({ ok: true });
  renderWithUi(
    <InlineEdit label="取引先名" labels={labels} onSave={onSave} value="株式会社サンプル" />
  );
  fireEvent.click(screen.getByRole('button', { name: '直す' }));
  fireEvent.change(screen.getByRole('textbox', { name: '取引先名' }), {
    target: { value: '株式会社テスト' },
  });

  fireEvent.click(screen.getByRole('button', { name: '保存する' }));

  const actual = await screen.findByText('保存しました');
  expect(actual).toBeInTheDocument();
  expect(onSave).toHaveBeenCalledWith('株式会社テスト');
});

it('保存に失敗した場合、入力欄を残して理由を出すこと', async () => {
  const onSave = vi.fn().mockResolvedValue({ message: '取引先名を入力してください', ok: false });
  renderWithUi(
    <InlineEdit label="取引先名" labels={labels} onSave={onSave} value="株式会社サンプル" />
  );
  fireEvent.click(screen.getByRole('button', { name: '直す' }));

  fireEvent.click(screen.getByRole('button', { name: '保存する' }));

  const actual = await screen.findByText('取引先名を入力してください');
  expect(actual).toBeInTheDocument();
});

it('やめるボタンを押した場合、値の表示に戻ること', () => {
  renderWithUi(
    <InlineEdit label="取引先名" labels={labels} onSave={vi.fn()} value="株式会社サンプル" />
  );
  fireEvent.click(screen.getByRole('button', { name: '直す' }));

  fireEvent.click(screen.getByRole('button', { name: 'やめる' }));

  const actual = screen.queryByRole('textbox');
  expect(actual).not.toBeInTheDocument();
});
