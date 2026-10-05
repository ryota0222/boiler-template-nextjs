// TanStack Table の table・row・cell は状態が変わっても同じ参照のままで、React Compiler が描画を使い回すと選択や絞り込みが画面に出ないため、最適化から外す
'use no memo';

import type { ReactTable, RowData } from '@tanstack/react-table';
import type { DataTableFeatures } from '@template/ui/table/dataTableFeatures';
import type { DataTableLabels } from '@template/ui/table/dataTableLabels';

import { Group, NativeSelect, Pagination, Text } from '@mantine/core';
import {
  pageSizeOptions,
  showAllOptionValue,
  showAllPageSize,
} from '@template/ui/table/dataTablePaging';

// Mantine の入力欄の sm の高さ。--input-height-sm は入力欄の要素の中でしか定義されず、隣の文字からは参照できない
const inputHeight = 'calc(2.25rem * var(--mantine-scale))';

export const DataTableFooter = <TData extends RowData>({
  labels,
  table,
}: {
  readonly labels: DataTableLabels<TData>;
  readonly table: ReactTable<DataTableFeatures, TData>;
}): React.JSX.Element => {
  const { pageIndex, pageSize } = table.state.pagination;
  const isShowingAll = pageSize === showAllPageSize;
  const total = table.getRowCount();
  const first = total === 0 ? 0 : pageIndex * pageSize + 1;
  const last = Math.min((pageIndex + 1) * pageSize, total);
  const controlProperties = {
    first: {},
    last: {},
    next: { 'aria-label': labels.pagination.next },
    previous: { 'aria-label': labels.pagination.previous },
  };
  return (
    // 件数の選択はラベルが上に付くため、下端で揃え、文字は入力欄と同じ行の高さにして縦の中央に置く
    <Group align="flex-end" justify="space-between">
      <Group align="flex-end" gap="sm">
        <NativeSelect
          data={[...pageSizeOptions, { label: labels.pageSizeAll, value: showAllOptionValue }]}
          label={labels.pageSize}
          onChange={(event) => {
            const { value } = event.currentTarget;
            table.setPageSize(value === showAllOptionValue ? showAllPageSize : Number(value));
          }}
          value={isShowingAll ? showAllOptionValue : String(pageSize)}
        />
        <Text lh={inputHeight} size="sm">
          {labels.range({ first, last, total })}
        </Text>
      </Group>
      {table.getPageCount() > 1 ? (
        // ページ送りのボタンは入力欄より低いため、入力欄と同じ高さの中で縦の中央に置く
        <Group h={inputHeight}>
          <Pagination
            getControlProps={(control) => controlProperties[control]}
            onChange={(page) => {
              table.setPageIndex(page - 1);
            }}
            total={table.getPageCount()}
            value={pageIndex + 1}
          />
        </Group>
      ) : null}
    </Group>
  );
};
