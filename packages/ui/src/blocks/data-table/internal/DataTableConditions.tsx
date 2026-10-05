// TanStack Table の table・row・cell は状態が変わっても同じ参照のままで、React Compiler が描画を使い回すと選択や絞り込みが画面に出ないため、最適化から外す
'use no memo';

import type { ReactTable, RowData } from '@tanstack/react-table';
import type { DataTableFeatures } from '@template/ui/table/dataTableFeatures';
import type { DataTableLabels } from '@template/ui/table/dataTableLabels';

import { Button, Group, Text } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { getLabeledColumns, toFilterValues } from '@template/ui/table/dataTableColumns';

const conditionIconSize = 14;

// 忘れた絞り込みで 0 件になるのを防ぐため、適用中の条件を開かずに見える場所に並べる（design-collection.md）
export const DataTableConditions = <TData extends RowData>({
  labels,
  onSearchChange,
  search,
  table,
}: {
  readonly labels: DataTableLabels<TData>;
  readonly onSearchChange: (search: string) => void;
  readonly search: string;
  readonly table: ReactTable<DataTableFeatures, TData>;
}): null | React.JSX.Element => {
  const filteredColumns = getLabeledColumns(table).filter(({ column }) => column.getIsFiltered());
  if (search === '' && filteredColumns.length === 0) {
    return null;
  }

  const removeIcon = <IconX aria-hidden size={conditionIconSize} />;
  return (
    <Group gap="xs">
      <Text size="sm">{labels.conditions}</Text>
      {search === '' ? null : (
        <Button
          onClick={() => {
            onSearchChange('');
          }}
          rightSection={removeIcon}
          size="compact-sm"
          variant="light"
        >
          {labels.searchCondition(search)}
        </Button>
      )}
      {filteredColumns.map(({ column, columnLabel }) => (
        <Button
          key={column.id}
          onClick={() => {
            column.setFilterValue(undefined);
          }}
          rightSection={removeIcon}
          size="compact-sm"
          variant="light"
        >
          {labels.columnFilterCondition({
            columnLabel,
            values: toFilterValues(column.getFilterValue()),
          })}
        </Button>
      ))}
      <Button
        onClick={() => {
          onSearchChange('');
          table.resetColumnFilters();
        }}
        size="compact-sm"
        variant="subtle"
      >
        {labels.clearConditions}
      </Button>
    </Group>
  );
};
