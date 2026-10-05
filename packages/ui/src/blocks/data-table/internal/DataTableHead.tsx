// TanStack Table の table・row・cell は状態が変わっても同じ参照のままで、React Compiler が描画を使い回すと選択や絞り込みが画面に出ないため、最適化から外す
'use no memo';

import type { Header, ReactTable, RowData } from '@tanstack/react-table';
import type { DataTableFeatures } from '@template/ui/table/dataTableFeatures';
import type { DataTableLabels } from '@template/ui/table/dataTableLabels';

import { Group, Table, UnstyledButton } from '@mantine/core';
import { IconArrowDown, IconArrowUp, IconSelector } from '@tabler/icons-react';
import { FlexRender } from '@tanstack/react-table';
import { DataTableColumnFilter } from '@template/ui/blocks/data-table/internal/DataTableColumnFilter';

const sortIconSize = 14;

const ariaSortByDirection = {
  asc: 'ascending',
  desc: 'descending',
} as const;

const sortIconByDirection = {
  asc: IconArrowUp,
  desc: IconArrowDown,
  none: IconSelector,
} as const;

const SortableHeader = <TData extends RowData>({
  header,
}: {
  readonly header: Header<DataTableFeatures, TData>;
}): React.JSX.Element => {
  if (!header.column.getCanSort()) {
    return <FlexRender header={header} />;
  }

  const sortDirection = header.column.getIsSorted();
  const SortIcon = sortIconByDirection[sortDirection === false ? 'none' : sortDirection];
  return (
    <UnstyledButton onClick={header.column.getToggleSortingHandler()}>
      <Group gap="xs" wrap="nowrap">
        <FlexRender header={header} />
        <SortIcon aria-hidden size={sortIconSize} />
      </Group>
    </UnstyledButton>
  );
};

const HeaderContent = <TData extends RowData>({
  header,
  labels,
}: {
  readonly header: Header<DataTableFeatures, TData>;
  readonly labels: DataTableLabels<TData>;
}): React.JSX.Element => (
  // 見出しの中は Group の横並びなので、text-align ではなく並びの寄せで右揃えにする
  <Group
    gap="xs"
    justify={header.column.columnDef.meta?.align === 'right' ? 'flex-end' : 'space-between'}
    wrap="nowrap"
  >
    <SortableHeader header={header} />
    <DataTableColumnFilter column={header.column} labels={labels} />
  </Group>
);

export const DataTableHead = <TData extends RowData>({
  labels,
  table,
}: {
  readonly labels: DataTableLabels<TData>;
  readonly table: ReactTable<DataTableFeatures, TData>;
}): React.JSX.Element => (
  <Table.Thead>
    {table.getHeaderGroups().map((headerGroup) => (
      <Table.Tr key={headerGroup.id}>
        {headerGroup.headers.map((header) => {
          const sortDirection = header.column.getIsSorted();
          return (
            <Table.Th
              aria-sort={sortDirection === false ? undefined : ariaSortByDirection[sortDirection]}
              colSpan={header.colSpan}
              key={header.id}
              ta={header.column.columnDef.meta?.align}
            >
              {header.isPlaceholder ? null : <HeaderContent header={header} labels={labels} />}
            </Table.Th>
          );
        })}
      </Table.Tr>
    ))}
  </Table.Thead>
);
