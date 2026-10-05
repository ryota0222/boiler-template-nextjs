// TanStack Table の table・row・cell は状態が変わっても同じ参照のままで、React Compiler が描画を使い回すと選択や絞り込みが画面に出ないため、最適化から外す
'use no memo';

import type { Column, ReactTable, RowData } from '@tanstack/react-table';
import type { DataTableFeatures } from '@template/ui/table/dataTableFeatures';
import type { DataTableLabels } from '@template/ui/table/dataTableLabels';
import type { ReactNode } from 'react';

import { Table } from '@mantine/core';

// 「すべて」で表の中をスクロールしても合計の行を下端に残すため、セルごとに固定して下の行を隠す。
// border-collapse の表では tfoot を固定すると Chromium で位置がずれるため、セルに付ける
const stickyBackground = 'var(--mantine-color-body)';
// 行の中のチェックボックスなどは position を持ち、固定した合計のセルより手前に描かれるため、重なり順を上げる。
// Mantine の固定した見出し（stickyHeader）の 3 より下にし、見出しと重なったときは見出しを手前にする
const stickyZIndex = 2;

const renderTotal = <TData extends RowData>({
  column,
  table,
}: {
  readonly column: Column<DataTableFeatures, TData>;
  readonly table: ReactTable<DataTableFeatures, TData>;
}): ReactNode => {
  const formatTotal = column.columnDef.meta?.formatTotal;
  if (formatTotal === undefined || column.getAggregationFns().length === 0) {
    return null;
  }

  // 合計は、検索と列の絞り込みを当てたあと、グループ化する前の行から出す
  return formatTotal(column.getAggregationValue({ rows: table.getFilteredRowModel().rows }));
};

export const hasTotalRow = <TData extends RowData>(
  table: ReactTable<DataTableFeatures, TData>
): boolean =>
  table.getVisibleLeafColumns().some((column) => column.columnDef.meta?.formatTotal !== undefined);

export const DataTableTotals = <TData extends RowData>({
  labels,
  table,
}: {
  readonly labels: DataTableLabels<TData>;
  readonly table: ReactTable<DataTableFeatures, TData>;
}): null | React.JSX.Element => {
  if (!hasTotalRow(table)) {
    return null;
  }

  const columns = table.getVisibleLeafColumns();
  const [firstColumn] = columns;
  return (
    <Table.Tfoot>
      <Table.Tr>
        {columns.map((column) =>
          column.id === firstColumn?.id ? (
            <Table.Th
              bg={stickyBackground}
              bottom={0}
              key={column.id}
              pos="sticky"
              scope="row"
              style={{ zIndex: stickyZIndex }}
            >
              {labels.total}
            </Table.Th>
          ) : (
            <Table.Td
              bg={stickyBackground}
              bottom={0}
              key={column.id}
              pos="sticky"
              style={{ zIndex: stickyZIndex }}
              ta={column.columnDef.meta?.align}
            >
              {renderTotal({ column, table })}
            </Table.Td>
          )
        )}
      </Table.Tr>
    </Table.Tfoot>
  );
};
