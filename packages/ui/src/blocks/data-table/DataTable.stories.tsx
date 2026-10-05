import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { DataTableLabels } from '@template/ui/table/dataTableLabels';

import { Badge, Button } from '@mantine/core';
import { DataTable } from '@template/ui/blocks/data-table/DataTable';
import { createDataTableColumnHelper } from '@template/ui/table/dataTableFeatures';
import { expect, userEvent, waitFor, within } from 'storybook/test';

type Order = {
  readonly amount: number;
  readonly customer: string;
  readonly februaryQuantity: number;
  readonly id: string;
  readonly januaryQuantity: number;
  readonly status: string;
};

const columnHelper = createDataTableColumnHelper<Order>();

const yenFormat = new Intl.NumberFormat('ja-JP', {
  currency: 'JPY',
  style: 'currency',
});

const formatYen = (value: unknown): string =>
  typeof value === 'number' ? yenFormat.format(value) : '';

const columns = columnHelper.columns([
  columnHelper.accessor('id', {
    header: '注文番号',
    meta: { filterVariant: 'text', label: '注文番号' },
  }),
  columnHelper.accessor('customer', {
    header: '顧客',
    meta: { filterVariant: 'select', label: '顧客' },
  }),
  columnHelper.accessor('status', {
    cell: ({ getValue }) => (
      <Badge color={getValue() === '未発送' ? 'orange' : 'green'} variant="dot">
        {getValue()}
      </Badge>
    ),
    header: '状態',
    meta: { filterVariant: 'select', label: '状態' },
  }),
  columnHelper.accessor('amount', {
    aggregatedCell: ({ getValue }) => `小計 ${formatYen(getValue())}`,
    aggregationFn: 'sum',
    cell: ({ getValue }) => formatYen(getValue()),
    header: '金額',
    meta: { align: 'right', formatTotal: formatYen, label: '金額' },
  }),
  columnHelper.accessor((order) => order.januaryQuantity + order.februaryQuantity, {
    aggregationFn: 'sum',
    header: '数量の計（1〜2月）',
    id: 'quantityTotal',
    meta: {
      align: 'right',
      formatTotal: String,
      label: '数量の計（1〜2月）',
    },
  }),
]);

const orders: readonly Order[] = [
  {
    amount: 6036,
    customer: '株式会社サンプル商事',
    februaryQuantity: 3,
    id: '#1024',
    januaryQuantity: 2,
    status: '未発送',
  },
  {
    amount: 12_800,
    customer: 'テスト工業株式会社',
    februaryQuantity: 5,
    id: '#1025',
    januaryQuantity: 1,
    status: '発送済み',
  },
  {
    amount: 3300,
    customer: '株式会社サンプル商事',
    februaryQuantity: 0,
    id: '#1026',
    januaryQuantity: 4,
    status: '発送済み',
  },
  {
    amount: 45_000,
    customer: '見本物産',
    februaryQuantity: 10,
    id: '#1027',
    januaryQuantity: 8,
    status: '未発送',
  },
];

const manyOrderCount = 300;
const amountStep = 1000;
const firstOrderNumber = 2000;

const manyOrders: readonly Order[] = [...Array.from({ length: manyOrderCount }).keys()].map(
  (index) => ({
    amount: (index + 1) * amountStep,
    customer: '見本物産',
    februaryQuantity: 1,
    id: `#${String(firstOrderNumber + index)}`,
    januaryQuantity: 1,
    status: '未発送',
  })
);

const labels: DataTableLabels<Order> = {
  clearConditions: '条件をすべて解除',
  clearSelection: '選択を解除',
  columnFilter: (columnLabel) => `${columnLabel}で絞り込む`,
  columnFilterCondition: ({ columnLabel, values }) => `${columnLabel}: ${values.join('、')}`,
  columnVisibility: '表示する列',
  conditions: '適用中の条件',
  empty: '注文はまだありません',
  groupBy: 'グループ化する列',
  groupByNone: 'グループ化しない',
  groupCount: (count) => `${String(count)} 件`,
  pageSize: '1 ページの件数',
  pageSizeAll: 'すべて',
  pagination: { next: '次のページ', previous: '前のページ' },
  range: ({ first, last, total }) =>
    `${String(first)}〜${String(last)}件を表示\u{3000}全${String(total)}件`,
  search: '注文を検索',
  searchCondition: (search) => `検索: ${search}`,
  searchPlaceholder: '注文番号・顧客',
  selectAll: '表示中の注文をすべて選択',
  selectGroup: ({ count, value }) => `${value} の注文 ${String(count)} 件を選択`,
  selection: (count) => `${String(count)} 件を選択中`,
  selectRow: (order) => `注文 ${order.id} を選択`,
  total: '合計',
};

const meta = {
  args: {
    columns,
    data: orders,
    getRowId: (order): string => order.id,
    hasColumnVisibility: true,
    hasGrouping: true,
    initialGroupingColumnId: null,
    labels,
    selectionActions: (selectedRows): React.JSX.Element => (
      <Button size="compact-sm">{`選択した${String(selectedRows.length)}件の注文を発送`}</Button>
    ),
  },
  component: DataTable<Order>,
} satisfies Meta<typeof DataTable<Order>>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ideal: Story = {
  name: '理想状態の場合',
};

export const Empty: Story = {
  args: { data: [] },
  name: '空の場合',
};

export const InitialGroupingColumnIdCustomer: Story = {
  args: { initialGroupingColumnId: 'customer' },
  name: 'initialGroupingColumnIdが顧客の場合',
};

// グループを開くと、グループの中の行と、開閉のボタンの aria-expanded が変わる
export const GroupExpanded: Story = {
  args: { initialGroupingColumnId: 'customer' },
  name: 'グループを開いた場合',
  play: async ({ canvasElement }): Promise<void> => {
    const groupButton = within(canvasElement).getByRole('button', {
      name: /見本物産/u,
    });
    await userEvent.click(groupButton);

    await waitFor(async () => {
      await expect(groupButton).toHaveAttribute('aria-expanded', 'true');
    });
  },
};

// 行を選ぶと、選んだ件数と、選択の解除と一括の操作のボタンが現れる
export const RowsSelected: Story = {
  name: '行を選んだ場合',
  play: async ({ canvasElement }): Promise<void> => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('checkbox', { name: '注文 #1024 を選択' }));

    await expect(canvas.getByRole('button', { name: '選択を解除' })).toBeInTheDocument();
  },
};

// 並べ替えると、見出しに aria-sort が付き、矢印のアイコンが入れ替わる
export const Sorted: Story = {
  name: '並べ替えた場合',
  play: async ({ canvasElement }): Promise<void> => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '金額' }));

    await expect(canvas.getByRole('columnheader', { name: '金額' })).toHaveAttribute(
      'aria-sort',
      'ascending'
    );
  },
};

export const ColumnVisibilityOpened: Story = {
  name: '表示する列を開いた場合',
  play: async ({ canvasElement }): Promise<void> => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: '表示する列' }));

    const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog');

    // 開く途中の半透明の一覧では、axe が文字のコントラストを正しく測れないため、不透明になるまで待つ。
    // toBeVisible は不透明度が 0 でなければ通るため、ここでは使えない
    await waitFor(async () => {
      await expect(getComputedStyle(dialog).opacity).toBe('1');
    });
  },
};

// 2 ページ以上になると、ページ送りのボタンが現れる
export const DataManyItems: Story = {
  args: { data: manyOrders },
  name: 'dataが複数ページにわたる場合',
};

// 「すべて」を選ぶと、見えている範囲の行だけを描く（仮想スクロール）ことをブラウザで確かめる
export const DataManyItemsShowingAll: Story = {
  args: { data: manyOrders },
  name: 'dataが多件で1ページの件数にすべてを選んだ場合',
  play: async ({ canvasElement }): Promise<void> => {
    const canvas = within(canvasElement);
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: '1 ページの件数' }), 'all');

    await expect(canvas.getAllByRole('row').length).toBeLessThan(manyOrderCount);

    const scrollArea = canvas.getByRole('table').parentElement;
    if (scrollArea === null) {
      throw new Error('表のスクロールの範囲がありません');
    }

    scrollArea.scrollTop = scrollArea.scrollHeight;
    await expect(await canvas.findByText('#2299')).toBeInTheDocument();
  },
};

// 絞り込みの一覧を Escape で閉じたとき、フォーカスが開いたボタンに戻ることをブラウザで確かめる
export const ColumnFilterClosedByEscape: Story = {
  name: '絞り込みの一覧をEscapeで閉じた場合',
  play: async ({ canvasElement }): Promise<void> => {
    const filterButton = within(canvasElement).getByRole('button', {
      name: '顧客で絞り込む',
    });
    await userEvent.click(filterButton);
    await within(canvasElement.ownerDocument.body).findByRole('checkbox', {
      name: '見本物産',
    });
    await userEvent.keyboard('{Escape}');

    await waitFor(async () => {
      await expect(filterButton).toHaveFocus();
    });
  },
};

// 文字の部分一致で絞り込めることをブラウザで確かめる
export const OrderNumberFiltered: Story = {
  name: '注文番号で絞り込んだ場合',
  play: async ({ canvasElement }): Promise<void> => {
    const canvas = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: '注文番号で絞り込む' })
    );
    await userEvent.type(await canvas.findByRole('textbox', { name: '注文番号' }), '1024');

    await expect(
      within(canvasElement).getByRole('button', { name: '注文番号: 1024' })
    ).toBeInTheDocument();
  },
};

// 値を選んでも絞り込みの一覧が閉じず、続けて選び直せることをブラウザで確かめる
export const CustomerFiltered: Story = {
  name: '顧客で絞り込んだ場合',
  play: async ({ canvasElement }): Promise<void> => {
    const canvas = within(canvasElement.ownerDocument.body);
    await userEvent.click(within(canvasElement).getByRole('button', { name: '顧客で絞り込む' }));
    await userEvent.click(await canvas.findByRole('checkbox', { name: '見本物産' }));

    await expect(await canvas.findByRole('checkbox', { name: '見本物産' })).toBeChecked();
  },
};
