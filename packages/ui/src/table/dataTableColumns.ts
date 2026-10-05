import type { Column, ReactTable, RowData } from '@tanstack/react-table';
import type { DataTableFeatures } from '@template/ui/table/dataTableFeatures';

import { toFilterText } from '@template/ui/table/dataTableFilterText';

// meta.label のある列だけが、絞り込み、表示の切り替え、グループ化、条件のチップの対象になる
export const getLabeledColumns = <TData extends RowData>(
  table: ReactTable<DataTableFeatures, TData>
): readonly {
  readonly column: Column<DataTableFeatures, TData>;
  readonly columnLabel: string;
}[] =>
  table.getAllLeafColumns().flatMap((column) => {
    const columnLabel = column.columnDef.meta?.label;
    return columnLabel === undefined ? [] : [{ column, columnLabel }];
  });

// 列ごとの絞り込みの値は、値の一覧から選んだ場合は配列、文字を入れた場合は文字列で持つ
export const toFilterValues = (filterValue: unknown): string[] => {
  if (Array.isArray(filterValue)) {
    return filterValue.map(toFilterText);
  }

  return filterValue === undefined ? [] : [toFilterText(filterValue)];
};

// 数値を含む値の一覧は、文字の順ではなく数の順（1、2、10）に並べる
export const filterOptionCollator = new Intl.Collator('ja', { numeric: true });
