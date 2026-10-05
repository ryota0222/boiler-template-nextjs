// TanStack Table の table・row・cell は状態が変わっても同じ参照のままで、React Compiler が描画を使い回すと選択や絞り込みが画面に出ないため、最適化から外す
'use no memo';

import type { Cell, ReactTable, Row, RowData } from '@tanstack/react-table';
import type { DataTableFeatures } from '@template/ui/table/dataTableFeatures';
import type { DataTableLabels } from '@template/ui/table/dataTableLabels';
import type { RefObject } from 'react';

import { Group, Table, Text, UnstyledButton } from '@mantine/core';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { FlexRender } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';

const expandIconSize = 14;
// 仮想スクロールで、まだ測っていない行の高さの見積もり。Mantine の Table の 1 行の高さに合わせる
const estimatedRowHeight = 40;
export const scrollAreaHeight = 640;
const overscanRowCount = 10;

const CellContent = <TData extends RowData>({
  cell,
  labels,
  row,
}: {
  readonly cell: Cell<DataTableFeatures, TData>;
  readonly labels: DataTableLabels<TData>;
  readonly row: Row<DataTableFeatures, TData>;
}): null | React.JSX.Element => {
  // グループの行では、aggregationFn を持たない列も通常の cell で描かれ、値のない状態の表示が出てしまう。
  // 選択欄のような値を持たない表示用の列（accessorFn がない列）は、グループの行でも描く
  if (
    row.getIsGrouped() &&
    !cell.getIsGrouped() &&
    !cell.getIsAggregated() &&
    cell.column.accessorFn !== undefined
  ) {
    return null;
  }

  if (!cell.getIsGrouped()) {
    return <FlexRender cell={cell} />;
  }

  const ExpandIcon = row.getIsExpanded() ? IconChevronDown : IconChevronRight;
  return (
    <UnstyledButton aria-expanded={row.getIsExpanded()} onClick={row.getToggleExpandedHandler()}>
      <Group gap="xs" wrap="nowrap">
        <ExpandIcon aria-hidden size={expandIconSize} />
        <FlexRender cell={cell} />
        <Text c="dimmed" component="span" size="sm">
          {labels.groupCount(row.subRows.length)}
        </Text>
      </Group>
    </UnstyledButton>
  );
};

const BodyRow = <TData extends RowData>({
  labels,
  row,
  rowIndex,
}: {
  readonly labels: DataTableLabels<TData>;
  readonly row: Row<DataTableFeatures, TData>;
  // 仮想スクロールで一部の行しか描かないとき、支援技術に何行目かを伝える（見出しの行が 1 行目）
  readonly rowIndex: number | undefined;
}): React.JSX.Element => (
  <Table.Tr aria-rowindex={rowIndex} aria-selected={row.getIsSelected()}>
    {row.getVisibleCells().map((cell) => (
      <Table.Td key={cell.id} ta={cell.column.columnDef.meta?.align}>
        <CellContent cell={cell} labels={labels} row={row} />
      </Table.Td>
    ))}
  </Table.Tr>
);

const SpacerRow = ({
  columnCount,
  height,
}: {
  readonly columnCount: number;
  readonly height: number;
}): null | React.JSX.Element =>
  height > 0 ? (
    <Table.Tr aria-hidden>
      <Table.Td colSpan={columnCount} h={height} p={0} />
    </Table.Tr>
  ) : null;

export const DataTableBody = <TData extends RowData>({
  isVirtualized,
  labels,
  scrollElementRef,
  table,
}: {
  readonly isVirtualized: boolean;
  readonly labels: DataTableLabels<TData>;
  readonly scrollElementRef: RefObject<HTMLDivElement | null>;
  readonly table: ReactTable<DataTableFeatures, TData>;
}): React.JSX.Element => {
  const { rows } = table.getRowModel();
  const columnCount = table.getVisibleLeafColumns().length;
  // フックは条件で呼び分けられないため、仮想スクロールは enabled で切り替える。
  // initialRect は、測る前（読み込み直後や jsdom）でもスクロールの範囲の高さぶんの行を描くため
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    enabled: isVirtualized,
    estimateSize: () => estimatedRowHeight,
    getScrollElement: () => scrollElementRef.current,
    initialRect: { height: scrollAreaHeight, width: 0 },
    overscan: overscanRowCount,
  });
  if (rows.length === 0) {
    return (
      <Table.Tbody>
        <Table.Tr>
          <Table.Td colSpan={columnCount}>
            <Text size="sm">{labels.empty}</Text>
          </Table.Td>
        </Table.Tr>
      </Table.Tbody>
    );
  }

  if (!isVirtualized) {
    return (
      <Table.Tbody>
        {rows.map((row) => (
          <BodyRow key={row.id} labels={labels} row={row} rowIndex={undefined} />
        ))}
      </Table.Tbody>
    );
  }

  const virtualRows = rowVirtualizer.getVirtualItems();
  const [firstVirtualRow] = virtualRows;
  const lastVirtualRow = virtualRows.at(-1);
  return (
    <Table.Tbody>
      <SpacerRow
        columnCount={columnCount}
        height={firstVirtualRow === undefined ? 0 : firstVirtualRow.start}
      />
      {virtualRows.flatMap((virtualRow) =>
        rows
          .slice(virtualRow.index, virtualRow.index + 1)
          .map((row) => (
            <BodyRow
              key={row.id}
              labels={labels}
              row={row}
              rowIndex={table.getHeaderGroups().length + virtualRow.index + 1}
            />
          ))
      )}
      <SpacerRow
        columnCount={columnCount}
        height={
          lastVirtualRow === undefined ? 0 : rowVirtualizer.getTotalSize() - lastVirtualRow.end
        }
      />
    </Table.Tbody>
  );
};
