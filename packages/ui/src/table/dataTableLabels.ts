export type DataTableLabels<TData> = {
  readonly clearConditions: string;
  readonly clearSelection: string;
  readonly columnFilter: (columnLabel: string) => string;
  readonly columnFilterCondition: (condition: {
    readonly columnLabel: string;
    readonly values: readonly string[];
  }) => string;
  readonly columnVisibility: string;
  readonly conditions: string;
  readonly empty: string;
  readonly groupBy: string;
  readonly groupByNone: string;
  readonly groupCount: (count: number) => string;
  readonly pageSize: string;
  readonly pageSizeAll: string;
  readonly pagination: {
    readonly next: string;
    readonly previous: string;
  };
  readonly range: (range: {
    readonly first: number;
    readonly last: number;
    readonly total: number;
  }) => string;
  readonly search: string;
  readonly searchCondition: (search: string) => string;
  readonly searchPlaceholder: string;
  readonly selectAll: string;
  readonly selectGroup: (group: { readonly count: number; readonly value: string }) => string;
  readonly selection: (count: number) => string;
  readonly selectRow: (row: TData) => string;
  readonly total: string;
};
