import type { RowData } from '@tanstack/react-table';
import type { DataTableColumnMeta } from '@template/ui/table/dataTableColumnMeta';

import {
  aggregationFn_count,
  aggregationFn_sum,
  columnFacetingFeature,
  columnFilteringFeature,
  columnGroupingFeature,
  columnVisibilityFeature,
  createColumnHelper,
  createExpandedRowModel,
  createFacetedRowModel,
  createFacetedUniqueValues,
  createFilteredRowModel,
  createGroupedRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  globalFilteringFeature,
  metaHelper,
  rowAggregationFeature,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
} from '@tanstack/react-table';
import { toFilterText } from '@template/ui/table/dataTableFilterText';

// 列ごとの絞り込みは、値の一覧から選んだ場合は配列（いずれかに一致）、文字を入れた場合は文字列（部分一致）で持つ。
// TanStack Table は filterFn を行、列の ID、絞り込みの値の 3 つの引数で呼ぶため、1 つの残余引数で受ける
const filterDataTableColumn = (
  ...[row, columnId, filterValue]: readonly [
    { readonly getValue: (columnId: string) => unknown },
    string,
    unknown,
  ]
): boolean => {
  const value = row.getValue(columnId);
  // 空の値（undefined）は、どの絞り込みにも一致させない。String(undefined) の "undefined" が
  // 文字の部分一致に引っかかるのを防ぐため
  if (value === undefined) {
    return false;
  }

  if (Array.isArray(filterValue)) {
    return filterValue.map(toFilterText).includes(toFilterText(value));
  }

  return toFilterText(value).toLowerCase().includes(toFilterText(filterValue).toLowerCase());
};

export const dataTableFeatures = tableFeatures({
  aggregationFns: { count: aggregationFn_count, sum: aggregationFn_sum },
  columnFacetingFeature,
  columnFilteringFeature,
  columnGroupingFeature,
  columnMeta: metaHelper<DataTableColumnMeta>(),
  columnVisibilityFeature,
  expandedRowModel: createExpandedRowModel(),
  facetedRowModel: createFacetedRowModel(),
  facetedUniqueValues: createFacetedUniqueValues(),
  filteredRowModel: createFilteredRowModel(),
  filterFns: {
    dataTableColumn: filterDataTableColumn,
    includesString: filterFn_includesString,
  },
  globalFilteringFeature,
  groupedRowModel: createGroupedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  rowAggregationFeature,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    basic: sortFn_basic,
    datetime: sortFn_datetime,
    text: sortFn_text,
  },
});

export const createDataTableColumnHelper = <TData extends RowData>(): ReturnType<
  typeof createColumnHelper<typeof dataTableFeatures, TData>
> => createColumnHelper<typeof dataTableFeatures, TData>();

export type DataTableColumns<TData extends RowData> = ReturnType<
  ReturnType<typeof createDataTableColumnHelper<TData>>['columns']
>;

export type DataTableFeatures = typeof dataTableFeatures;
