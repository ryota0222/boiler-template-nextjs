// TanStack Table の table・row・cell は状態が変わっても同じ参照のままで、React Compiler が描画を使い回すと選択や絞り込みが画面に出ないため、最適化から外す
'use no memo';

import type { Column, RowData } from '@tanstack/react-table';
import type { DataTableFeatures } from '@template/ui/table/dataTableFeatures';
import type { DataTableLabels } from '@template/ui/table/dataTableLabels';

import { ActionIcon, Checkbox, Popover, Stack, TextInput } from '@mantine/core';
import { IconFilter } from '@tabler/icons-react';
import { filterOptionCollator, toFilterValues } from '@template/ui/table/dataTableColumns';
import { toFilterText } from '@template/ui/table/dataTableFilterText';

const filterIconSize = 14;

// 値の一覧は、ほかの条件で絞り込んだあとの行から作る。選んでいる値がほかの条件で消えても外せるよう、
// 選んでいる値は一覧に残す。空の値は選べない（どの絞り込みにも一致しない）ため一覧に出さない
const toFilterOptions = <TData extends RowData>(
  column: Column<DataTableFeatures, TData>
): string[] => {
  const facetedValues = [...column.getFacetedUniqueValues().keys()]
    .filter((value) => value !== undefined)
    .map(toFilterText);
  return [...new Set([...facetedValues, ...toFilterValues(column.getFilterValue())])].toSorted(
    filterOptionCollator.compare
  );
};

const SelectFilter = <TData extends RowData>({
  column,
  label,
}: {
  readonly column: Column<DataTableFeatures, TData>;
  readonly label: string;
}): React.JSX.Element => (
  <Checkbox.Group
    label={label}
    onChange={(values) => {
      column.setFilterValue(values.length === 0 ? undefined : values);
    }}
    value={toFilterValues(column.getFilterValue())}
  >
    <Stack gap="xs" mt="xs">
      {toFilterOptions(column).map((value) => (
        <Checkbox key={value} label={value} size="md" value={value} />
      ))}
    </Stack>
  </Checkbox.Group>
);

const TextFilter = <TData extends RowData>({
  column,
  label,
}: {
  readonly column: Column<DataTableFeatures, TData>;
  readonly label: string;
}): React.JSX.Element => {
  const filterValue = column.getFilterValue();
  return (
    <TextInput
      label={label}
      onChange={(event) => {
        const { value } = event.currentTarget;
        column.setFilterValue(value === '' ? undefined : value);
      }}
      value={typeof filterValue === 'string' ? filterValue : ''}
    />
  );
};

// label と filterVariant の両方がある列だけを絞り込めるようにする。見出しの中は操作が密集するため、
// 絞り込みのボタンは md（28px）にする（design-a11y.md の「dense, pointer-only surfaces」）
export const DataTableColumnFilter = <TData extends RowData>({
  column,
  labels,
}: {
  readonly column: Column<DataTableFeatures, TData>;
  readonly labels: DataTableLabels<TData>;
}): null | React.JSX.Element => {
  const { meta } = column.columnDef;
  if (meta?.label === undefined || meta.filterVariant === undefined) {
    return null;
  }

  return (
    <Popover position="bottom-start" returnFocus shadow="md" trapFocus>
      <Popover.Target>
        <ActionIcon
          aria-label={labels.columnFilter(meta.label)}
          size="md"
          variant={column.getIsFiltered() ? 'light' : 'subtle'}
        >
          <IconFilter aria-hidden size={filterIconSize} />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown>
        {meta.filterVariant === 'select' ? (
          <SelectFilter column={column} label={meta.label} />
        ) : (
          <TextFilter column={column} label={meta.label} />
        )}
      </Popover.Dropdown>
    </Popover>
  );
};
