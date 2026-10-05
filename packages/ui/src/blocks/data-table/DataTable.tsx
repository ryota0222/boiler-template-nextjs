'use client';
// TanStack Table の table・row・cell は状態が変わっても同じ参照のままで、React Compiler が描画を使い回すと選択や絞り込みが画面に出ないため、最適化から外す
'use no memo';

import type { RowData } from '@tanstack/react-table';
import type { DataTableColumns } from '@template/ui/table/dataTableFeatures';
import type { DataTableLabels } from '@template/ui/table/dataTableLabels';
import type { ReactNode, RefObject } from 'react';

import { Checkbox, Paper, Stack, Table } from '@mantine/core';
import { useTable } from '@tanstack/react-table';
import classes from '@template/ui/blocks/data-table/DataTable.module.css';
import {
  DataTableBody,
  scrollAreaHeight,
} from '@template/ui/blocks/data-table/internal/DataTableBody';
import { DataTableFooter } from '@template/ui/blocks/data-table/internal/DataTableFooter';
import { DataTableHead } from '@template/ui/blocks/data-table/internal/DataTableHead';
import { DataTableToolbar } from '@template/ui/blocks/data-table/internal/DataTableToolbar';
import {
  DataTableTotals,
  hasTotalRow,
} from '@template/ui/blocks/data-table/internal/DataTableTotals';
import {
  createDataTableColumnHelper,
  dataTableFeatures,
} from '@template/ui/table/dataTableFeatures';
import { defaultPageSize, showAllPageSize } from '@template/ui/table/dataTablePaging';
import { useMemo, useRef, useState } from 'react';

const createSelectionColumn = <TData extends RowData>(
  labelsReference: RefObject<DataTableLabels<TData>>
): DataTableColumns<TData>[number] =>
  createDataTableColumnHelper<TData>().display({
    cell: ({ row }) => (
      <Checkbox
        aria-label={
          row.getIsGrouped()
            ? labelsReference.current.selectGroup({
                count: row.subRows.length,
                value: String(row.groupingValue),
              })
            : labelsReference.current.selectRow(row.original)
        }
        checked={row.getIsSelected()}
        indeterminate={row.getIsSomeSelected()}
        onChange={row.getToggleSelectedHandler()}
        size="md"
      />
    ),
    enableHiding: false,
    header: ({ table: headerTable }) => (
      <Checkbox
        aria-label={labelsReference.current.selectAll}
        checked={headerTable.getIsAllPageRowsSelected()}
        indeterminate={headerTable.getIsSomePageRowsSelected()}
        onChange={headerTable.getToggleAllPageRowsSelectedHandler()}
        size="md"
      />
    ),
    id: 'selection',
  });

export const DataTable = <TData extends RowData>({
  columns,
  data,
  getRowId,
  hasColumnVisibility,
  hasGrouping,
  initialGroupingColumnId,
  labels,
  selectionActions,
}: {
  readonly columns: DataTableColumns<TData>;
  readonly data: readonly TData[];
  readonly getRowId: (row: TData) => string;
  readonly hasColumnVisibility: boolean;
  readonly hasGrouping: boolean;
  readonly initialGroupingColumnId: null | string;
  readonly labels: DataTableLabels<TData>;
  // 一括の操作を持たない一覧は、選択しても何もできないため、null を渡して選択の欄ごと出さない
  readonly selectionActions: ((selectedRows: readonly TData[]) => ReactNode) | null;
}): React.JSX.Element => {
  const [search, setSearch] = useState('');
  const [groupingColumnId, setGroupingColumnId] = useState(initialGroupingColumnId);
  const grouping = useMemo(
    () => (groupingColumnId === null ? [] : [groupingColumnId]),
    [groupingColumnId]
  );
  const scrollElementReference = useRef<HTMLDivElement>(null);
  // アプリは labels を描画のたびに作ることが多い。列の定義が labels に依存すると列が毎回作り直され、
  // グループ化中は TanStack Table がページを 1 ページ目に戻すため、列は ref から最新の labels を読む
  const labelsReference = useRef(labels);
  labelsReference.current = labels;
  // TanStack Table は data の参照が変わるたびにページと開閉の状態を戻すため、描画をまたいで同じ参照を渡す
  const tableData = useMemo(() => [...data], [data]);
  const hasRowSelection = selectionActions !== null;
  const tableColumns = useMemo(
    () => (hasRowSelection ? [createSelectionColumn(labelsReference), ...columns] : [...columns]),
    [columns, hasRowSelection]
  );

  const table = useTable(
    {
      columns: tableColumns,
      data: tableData,
      // 空の値は昇順でも降順でも最後に並べる（design-collection.md）。TanStack Table が空とみなすのは
      // undefined だけなので、空の値は null ではなく undefined で渡す
      defaultColumn: { filterFn: 'dataTableColumn', sortUndefined: 'last' },
      features: dataTableFeatures,
      getRowId,
      globalFilterFn: 'includesString',
      // グループ化した列を先頭に動かすと、選択欄が先頭の列でなくなるため
      groupedColumnMode: false,
      initialState: { pagination: { pageIndex: 0, pageSize: defaultPageSize } },
      // TanStack Table は数値の列だけ最初の押下で降順にする。Excel と同じく、どの列も昇順から始める
      sortDescFirst: false,
      state: { globalFilter: search, grouping },
    },
    (state) => state
  );

  const isShowingAll = table.state.pagination.pageSize === showAllPageSize;
  return (
    <Stack gap="sm">
      <DataTableToolbar
        groupingColumnId={groupingColumnId}
        hasColumnVisibility={hasColumnVisibility}
        hasGrouping={hasGrouping}
        labels={labels}
        onGroupingColumnIdChange={setGroupingColumnId}
        onSearchChange={setSearch}
        search={search}
        selectionActions={selectionActions}
        table={table}
      />
      {/* 「すべて」では行が多くなるため、ページではなく表の中だけをスクロールさせる（design-collection.md） */}
      <Paper
        mah={isShowingAll ? scrollAreaHeight : 'none'}
        ref={scrollElementReference}
        shadow="xs"
        style={{ overflow: 'auto' }}
        withBorder
      >
        <Table
          // 仮想スクロールでは一部の行しか描かないため、見出し、本体、合計の行の数を支援技術に伝える
          aria-rowcount={
            isShowingAll
              ? table.getHeaderGroups().length +
                table.getRowModel().rows.length +
                (hasTotalRow(table) ? 1 : 0)
              : undefined
          }
          className={classes.table}
          highlightOnHover
          stickyHeader
          tabularNums
        >
          <DataTableHead labels={labels} table={table} />
          <DataTableBody
            isVirtualized={table.state.pagination.pageSize === showAllPageSize}
            labels={labels}
            scrollElementRef={scrollElementReference}
            table={table}
          />
          <DataTableTotals labels={labels} table={table} />
        </Table>
      </Paper>
      <DataTableFooter labels={labels} table={table} />
    </Stack>
  );
};
