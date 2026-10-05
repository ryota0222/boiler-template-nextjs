// TanStack Table の table・row・cell は状態が変わっても同じ参照のままで、React Compiler が描画を使い回すと選択や絞り込みが画面に出ないため、最適化から外す
'use no memo';

import type { ReactTable, RowData } from '@tanstack/react-table';
import type { DataTableFeatures } from '@template/ui/table/dataTableFeatures';
import type { DataTableLabels } from '@template/ui/table/dataTableLabels';
import type { ReactNode } from 'react';

import {
  Button,
  Checkbox,
  Group,
  NativeSelect,
  Popover,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { IconColumns } from '@tabler/icons-react';
import { DataTableConditions } from '@template/ui/blocks/data-table/internal/DataTableConditions';
import { getLabeledColumns } from '@template/ui/table/dataTableColumns';

const columnsIconSize = 16;

const GroupingSelect = <TData extends RowData>({
  groupingColumnId,
  labels,
  onGroupingColumnIdChange,
  table,
}: {
  readonly groupingColumnId: null | string;
  readonly labels: DataTableLabels<TData>;
  readonly onGroupingColumnIdChange: (groupingColumnId: null | string) => void;
  readonly table: ReactTable<DataTableFeatures, TData>;
}): React.JSX.Element => (
  <NativeSelect
    data={[
      { label: labels.groupByNone, value: '' },
      ...getLabeledColumns(table)
        // 隠した列でグループ化すると、グループの名前と開閉のボタンが見えなくなるため
        .filter(({ column }) => column.getCanGroup() && column.getIsVisible())
        .map(({ column, columnLabel }) => ({
          label: columnLabel,
          value: column.id,
        })),
    ]}
    label={labels.groupBy}
    onChange={(event) => {
      const { value } = event.currentTarget;
      onGroupingColumnIdChange(value === '' ? null : value);
    }}
    // 「グループ化しない」の選択肢の値が空文字のため
    value={groupingColumnId ?? ''}
  />
);

const ColumnVisibilityPopover = <TData extends RowData>({
  labels,
  table,
}: {
  readonly labels: DataTableLabels<TData>;
  readonly table: ReactTable<DataTableFeatures, TData>;
}): React.JSX.Element => (
  <Popover position="bottom-end" returnFocus shadow="md" trapFocus>
    <Popover.Target>
      <Button leftSection={<IconColumns aria-hidden size={columnsIconSize} />} variant="default">
        {labels.columnVisibility}
      </Button>
    </Popover.Target>
    <Popover.Dropdown>
      <Stack gap="xs">
        {getLabeledColumns(table)
          // グループ化している列を隠すと、グループの名前と開閉のボタンが消えるため
          .filter(({ column }) => column.getCanHide() && !column.getIsGrouped())
          .map(({ column, columnLabel }) => (
            <Checkbox
              checked={column.getIsVisible()}
              key={column.id}
              label={columnLabel}
              onChange={column.getToggleVisibilityHandler()}
              size="md"
            />
          ))}
      </Stack>
    </Popover.Dropdown>
  </Popover>
);

const SelectionBar = <TData extends RowData>({
  labels,
  selectionActions,
  table,
}: {
  readonly labels: DataTableLabels<TData>;
  readonly selectionActions: (selectedRows: readonly TData[]) => ReactNode;
  readonly table: ReactTable<DataTableFeatures, TData>;
}): React.JSX.Element => {
  const selectedRows = table.getFilteredSelectedRowModel().rows.map((row) => row.original);
  return (
    <Group gap="sm">
      <Text role="status" size="sm">
        {selectedRows.length > 0 ? labels.selection(selectedRows.length) : ''}
      </Text>
      {selectedRows.length > 0 ? (
        <>
          <Button
            onClick={() => {
              table.resetRowSelection();
            }}
            size="compact-sm"
            variant="subtle"
          >
            {labels.clearSelection}
          </Button>
          {selectionActions(selectedRows)}
        </>
      ) : null}
    </Group>
  );
};

export const DataTableToolbar = <TData extends RowData>({
  groupingColumnId,
  hasColumnVisibility,
  hasGrouping,
  labels,
  onGroupingColumnIdChange,
  onSearchChange,
  search,
  selectionActions,
  table,
}: {
  readonly groupingColumnId: null | string;
  readonly hasColumnVisibility: boolean;
  readonly hasGrouping: boolean;
  readonly labels: DataTableLabels<TData>;
  readonly onGroupingColumnIdChange: (groupingColumnId: null | string) => void;
  readonly onSearchChange: (search: string) => void;
  readonly search: string;
  readonly selectionActions: ((selectedRows: readonly TData[]) => ReactNode) | null;
  readonly table: ReactTable<DataTableFeatures, TData>;
}): React.JSX.Element => (
  <Stack gap="xs">
    <Group align="flex-end" justify="space-between">
      <TextInput
        label={labels.search}
        onChange={(event) => {
          onSearchChange(event.currentTarget.value);
        }}
        placeholder={labels.searchPlaceholder}
        value={search}
      />
      <Group align="flex-end" gap="sm">
        {hasGrouping ? (
          <GroupingSelect
            groupingColumnId={groupingColumnId}
            labels={labels}
            onGroupingColumnIdChange={onGroupingColumnIdChange}
            table={table}
          />
        ) : null}
        {hasColumnVisibility ? <ColumnVisibilityPopover labels={labels} table={table} /> : null}
      </Group>
    </Group>
    <DataTableConditions
      labels={labels}
      onSearchChange={onSearchChange}
      search={search}
      table={table}
    />
    {selectionActions === null ? null : (
      <SelectionBar labels={labels} selectionActions={selectionActions} table={table} />
    )}
  </Stack>
);
