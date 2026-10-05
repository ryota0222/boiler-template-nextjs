import type { ReactNode } from 'react';

// TanStack Table の列の meta は列ごとに省略できる必要があるため、どの項目も省略できる
export type DataTableColumnMeta = {
  // 金額と日付は右に揃える（design-collection.md）
  readonly align?: 'left' | 'right';
  // 値の一覧から選ぶか、文字の部分一致で絞り込むか。ない列は絞り込めない
  readonly filterVariant?: 'select' | 'text';
  // 列の合計の行に出す値の書式。aggregationFn と両方がある列だけ合計を出す
  readonly formatTotal?: (total: unknown) => ReactNode;
  // 絞り込み、表示の切り替え、グループ化の選択肢、条件のチップで使う列の名前。ない列はこれらの対象にしない
  readonly label?: string;
};
