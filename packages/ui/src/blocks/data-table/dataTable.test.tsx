import type { DataTableLabels } from '@template/ui/table/dataTableLabels';

import { Button } from '@mantine/core';
import { DataTable } from '@template/ui/blocks/data-table/DataTable';
import { createDataTableColumnHelper } from '@template/ui/table/dataTableFeatures';
import { renderWithUi } from '@template/ui/testing/TestRendering';
import { fireEvent, screen, within } from '@testing-library/react';
import { useState } from 'react';
import { expect, it } from 'vitest';

type Order = {
  readonly amount: number | undefined;
  readonly customer: string;
  readonly februaryQuantity: number;
  readonly id: string;
  readonly januaryQuantity: number;
  readonly status: string | undefined;
};

const columnHelper = createDataTableColumnHelper<Order>();

const columns = columnHelper.columns([
  columnHelper.accessor('id', {
    cell: ({ getValue }) => `注文番号 ${getValue()}`,
    header: '注文番号',
    meta: { label: '注文番号' },
  }),
  columnHelper.accessor('customer', {
    header: '顧客',
    meta: { filterVariant: 'select', label: '顧客' },
  }),
  columnHelper.accessor('status', {
    header: '状態',
    meta: { filterVariant: 'text', label: '状態' },
  }),
  columnHelper.accessor('amount', {
    aggregatedCell: ({ getValue }) => `合計 ${String(getValue())} 円`,
    aggregationFn: 'sum',
    cell: ({ getValue }) => `${String(getValue())} 円`,
    header: '金額',
    meta: {
      align: 'right',
      filterVariant: 'select',
      formatTotal: (total) => `${String(total)} 円`,
      label: '金額',
    },
  }),
  // 行の合計の列は、行の中の値を足した accessor の列として定義する
  columnHelper.accessor((order) => order.januaryQuantity + order.februaryQuantity, {
    aggregatedCell: ({ getValue }) => `小計 ${String(getValue())} 個`,
    aggregationFn: 'sum',
    cell: ({ getValue }) => `${String(getValue())} 個`,
    header: '数量の計',
    id: 'quantityTotal',
    meta: {
      formatTotal: (total) => `${String(total)} 個`,
      label: '数量の計',
    },
  }),
]);

const orders: readonly Order[] = [
  {
    amount: 3000,
    customer: 'A社',
    februaryQuantity: 3,
    id: '1',
    januaryQuantity: 2,
    status: '未発送',
  },
  {
    amount: 1000,
    customer: 'B社',
    februaryQuantity: 1,
    id: '2',
    januaryQuantity: 1,
    status: '発送済み',
  },
  {
    amount: 2000,
    customer: 'A社',
    februaryQuantity: 0,
    id: '3',
    januaryQuantity: 4,
    status: '発送済み',
  },
];

const orderWithoutAmount: Order = {
  amount: undefined,
  customer: 'D社',
  februaryQuantity: 0,
  id: '4',
  januaryQuantity: 0,
  status: '未発送',
};

const createOrders = (count: number): readonly Order[] =>
  [...Array.from({ length: count }).keys()].map((index) => ({
    amount: index,
    customer: `顧客${String(index + 1)}`,
    februaryQuantity: 0,
    id: String(index + 1),
    januaryQuantity: 0,
    status: '未発送',
  }));

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

const renderDataTable = ({
  data,
  initialGroupingColumnId,
}: {
  readonly data: readonly Order[];
  readonly initialGroupingColumnId: null | string;
}): void => {
  renderWithUi(
    <DataTable
      columns={columns}
      data={data}
      getRowId={(order) => order.id}
      hasColumnVisibility
      hasGrouping
      initialGroupingColumnId={initialGroupingColumnId}
      labels={labels}
      selectionActions={(selectedRows) => (
        <Button>{`選択した${String(selectedRows.length)}件の注文を発送`}</Button>
      )}
    />
  );
};

const renderOrders = (): void => {
  renderDataTable({ data: orders, initialGroupingColumnId: null });
};

const renderGroupedOrders = (): void => {
  renderDataTable({ data: orders, initialGroupingColumnId: 'customer' });
};

const getBodyRows = (): HTMLElement[] => {
  const [, body] = screen.getAllByRole('rowgroup');
  if (body === undefined) {
    throw new Error('表の本体がありません');
  }

  return within(body).queryAllByRole('row');
};

const getTotalRow = (): HTMLElement => {
  const foot = screen.getAllByRole('rowgroup')[2];
  if (foot === undefined) {
    throw new Error('合計の行がありません');
  }

  return within(foot).getByRole('row');
};

const waitForNextTask = async (): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, 0);
  });

const search = (value: string): void => {
  fireEvent.change(screen.getByRole('textbox', { name: '注文を検索' }), {
    target: { value },
  });
};

const selectCustomerFilter = async (customer: string): Promise<void> => {
  fireEvent.click(screen.getByRole('button', { name: '顧客で絞り込む' }));
  fireEvent.click(await screen.findByRole('checkbox', { name: customer }));
};

it('行を渡した場合、行ごとに描画すること', () => {
  renderOrders();

  const actual = getBodyRows();

  expect(actual).toHaveLength(3);
});

it('行がない場合、行がないことを示す文言を描画すること', () => {
  renderDataTable({ data: [], initialGroupingColumnId: null });

  const actual = screen.getByText('注文はまだありません');

  expect(actual).toBeInTheDocument();
});

it('列の見出しを押した場合、その列の見出しに昇順の並べ替えを示す属性を付けること', () => {
  renderOrders();

  fireEvent.click(screen.getByRole('button', { name: '金額' }));

  expect(screen.getByRole('columnheader', { name: /金額/u })).toHaveAttribute(
    'aria-sort',
    'ascending'
  );
});

it('列の見出しを押した場合、その列の値で行を並べ替えること', () => {
  renderOrders();

  fireEvent.click(screen.getByRole('button', { name: '金額' }));

  expect(getBodyRows()[0]).toHaveTextContent('1000 円');
});

it('列の見出しを押した場合、空の値を最後に並べること', () => {
  renderDataTable({
    data: [...orders, orderWithoutAmount],
    initialGroupingColumnId: null,
  });

  fireEvent.click(screen.getByRole('button', { name: '金額' }));

  expect(getBodyRows()[3]).toHaveTextContent('D社');
});

it('列の見出しを 2 回押した場合、空の値を最後に並べること', () => {
  renderDataTable({
    data: [...orders, orderWithoutAmount],
    initialGroupingColumnId: null,
  });

  fireEvent.click(screen.getByRole('button', { name: '金額' }));
  fireEvent.click(screen.getByRole('button', { name: '金額' }));

  expect(getBodyRows()[3]).toHaveTextContent('D社');
});

it('行を選択した場合、その行に選択中であることを示す属性を付けること', () => {
  renderOrders();

  fireEvent.click(screen.getByRole('checkbox', { name: '注文 1 を選択' }));

  expect(screen.getByRole('checkbox', { name: '注文 1 を選択' }).closest('tr')).toHaveAttribute(
    'aria-selected',
    'true'
  );
});

it('行を選択した場合、選択した件数を表示すること', () => {
  renderOrders();

  fireEvent.click(screen.getByRole('checkbox', { name: '注文 1 を選択' }));

  expect(screen.getByText('1 件を選択中')).toBeInTheDocument();
});

it('行を選択した場合、一括操作を表示すること', () => {
  renderOrders();

  fireEvent.click(screen.getByRole('checkbox', { name: '注文 1 を選択' }));

  expect(screen.getByRole('button', { name: '選択した1件の注文を発送' })).toBeInTheDocument();
});

it('行を選択していない場合、一括操作を表示しないこと', () => {
  renderOrders();

  const actual = screen.queryByRole('button', { name: /注文を発送/u });

  expect(actual).not.toBeInTheDocument();
});

it('選択を解除を押した場合、選択をすべて外すこと', () => {
  renderOrders();

  fireEvent.click(screen.getByRole('checkbox', { name: '注文 1 を選択' }));
  fireEvent.click(screen.getByRole('button', { name: '選択を解除' }));

  expect(screen.getByRole('checkbox', { name: '注文 1 を選択' })).not.toBeChecked();
});

it('見出しの選択欄を押した場合、表示中の行をすべて選択すること', () => {
  renderOrders();

  fireEvent.click(screen.getByRole('checkbox', { name: '表示中の注文をすべて選択' }));

  expect(screen.getByText('3 件を選択中')).toBeInTheDocument();
});

it('検索で見えなくなった行は、一括操作の対象に含めないこと', () => {
  renderOrders();

  fireEvent.click(screen.getByRole('checkbox', { name: '表示中の注文をすべて選択' }));
  search('B社');

  expect(screen.getByRole('button', { name: '選択した1件の注文を発送' })).toBeInTheDocument();
});

it('検索欄に入力した場合、一致する行だけを描画すること', () => {
  renderOrders();

  search('B社');

  expect(getBodyRows()).toHaveLength(1);
});

it('検索欄に入力した場合、適用中の条件として検索の値を表示すること', () => {
  renderOrders();

  search('B社');

  expect(screen.getByRole('button', { name: '検索: B社' })).toBeInTheDocument();
});

it('適用中の条件の検索を押した場合、検索を解除してすべての行を描画すること', () => {
  renderOrders();

  search('B社');
  fireEvent.click(screen.getByRole('button', { name: '検索: B社' }));

  expect(getBodyRows()).toHaveLength(3);
});

it('列の値の一覧から選んだ場合、その値の行だけを描画すること', async () => {
  renderOrders();

  await selectCustomerFilter('A社');

  expect(getBodyRows()).toHaveLength(2);
});

it('列の値の一覧から選んだ場合、適用中の条件として列と値を表示すること', async () => {
  renderOrders();

  await selectCustomerFilter('A社');

  expect(screen.getByRole('button', { name: '顧客: A社' })).toBeInTheDocument();
});

it('適用中の条件の列の絞り込みを押した場合、その絞り込みを解除すること', async () => {
  renderOrders();

  await selectCustomerFilter('A社');
  fireEvent.click(screen.getByRole('button', { name: '顧客: A社' }));

  expect(getBodyRows()).toHaveLength(3);
});

it('列の値の一覧で選んだ値を外した場合、その列の絞り込みを解除すること', async () => {
  renderOrders();

  await selectCustomerFilter('A社');
  // jsdom では値を選んだあとに一覧が非表示の扱いになる（ブラウザでは開いたまま。ストーリーの
  // 「顧客で絞り込んだ場合」で確かめる）ため、非表示の要素も含めて探す
  fireEvent.click(await screen.findByRole('checkbox', { hidden: true, name: 'A社' }));

  expect(getBodyRows()).toHaveLength(3);
});

it('列に入れた文字を消した場合、その列の絞り込みを解除すること', async () => {
  renderOrders();

  fireEvent.click(screen.getByRole('button', { name: '状態で絞り込む' }));
  const input = await screen.findByRole('textbox', { name: '状態' });
  fireEvent.change(input, { target: { value: '未発' } });
  fireEvent.change(input, { target: { value: '' } });

  expect(getBodyRows()).toHaveLength(3);
});

it('列に文字を入れて絞り込んだ場合、部分一致する行だけを描画すること', async () => {
  renderOrders();

  fireEvent.click(screen.getByRole('button', { name: '状態で絞り込む' }));
  fireEvent.change(await screen.findByRole('textbox', { name: '状態' }), {
    target: { value: '未発' },
  });

  expect(getBodyRows()).toHaveLength(1);
});

it('条件をすべて解除を押した場合、検索と列の絞り込みをすべて解除すること', async () => {
  renderOrders();

  search('A社');
  await selectCustomerFilter('A社');
  fireEvent.click(screen.getByRole('button', { name: '条件をすべて解除' }));

  expect(getBodyRows()).toHaveLength(3);
});

it('表示する列で列を外した場合、その列を描画しないこと', async () => {
  renderOrders();

  fireEvent.click(screen.getByRole('button', { name: '表示する列' }));
  fireEvent.click(await screen.findByRole('checkbox', { name: '状態' }));

  expect(screen.queryByRole('columnheader', { name: /状態/u })).not.toBeInTheDocument();
});

it('合計の行に、集計する列の合計を描画すること', () => {
  renderOrders();

  const actual = getTotalRow();

  expect(actual).toHaveTextContent('6000 円');
});

it('合計の行に、行の合計の列の合計を描画すること', () => {
  renderOrders();

  const actual = getTotalRow();

  expect(actual).toHaveTextContent('11 個');
});

it('絞り込んだ場合、合計の行に絞り込んだ行だけの合計を描画すること', async () => {
  renderOrders();

  await selectCustomerFilter('A社');

  expect(getTotalRow()).toHaveTextContent('5000 円');
});

it('行の合計の列に、行の中の値を足した合計を描画すること', () => {
  renderOrders();

  const actual = getBodyRows()[0];

  expect(actual).toHaveTextContent('5 個');
});

it('行が 20 件を超える場合、最初のページには 20 件だけを描画すること', () => {
  renderDataTable({ data: createOrders(21), initialGroupingColumnId: null });

  const actual = getBodyRows();

  expect(actual).toHaveLength(20);
});

it('表示している範囲と全体の件数を表示すること', () => {
  renderDataTable({ data: createOrders(21), initialGroupingColumnId: null });

  // 既定の正規化は検索する文字列の全角の空白だけを半角にし、画面の文字列と一致しなくなるため
  const actual = screen.getByText('1〜20件を表示\u{3000}全21件', {
    normalizer: (text) => text,
  });

  expect(actual).toBeInTheDocument();
});

it('1 ページの件数に 50 を選んだ場合、50 件までを 1 ページに描画すること', () => {
  renderDataTable({ data: createOrders(21), initialGroupingColumnId: null });

  fireEvent.change(screen.getByRole('combobox', { name: '1 ページの件数' }), {
    target: { value: '50' },
  });

  expect(getBodyRows()).toHaveLength(21);
});

it('1 ページの件数にすべてを選んだ場合、全体の件数を 1 ページとして表示すること', () => {
  renderDataTable({ data: createOrders(200), initialGroupingColumnId: null });

  fireEvent.change(screen.getByRole('combobox', { name: '1 ページの件数' }), {
    target: { value: 'all' },
  });

  expect(
    screen.getByText('1〜200件を表示\u{3000}全200件', {
      normalizer: (text) => text,
    })
  ).toBeInTheDocument();
});

it('1 ページの件数にすべてを選んだ場合、見えている範囲の行だけを描画すること', () => {
  renderDataTable({ data: createOrders(200), initialGroupingColumnId: null });

  fireEvent.change(screen.getByRole('combobox', { name: '1 ページの件数' }), {
    target: { value: 'all' },
  });

  expect(getBodyRows().length).toBeLessThan(200);
});

it('次のページを押した場合、残りの行を描画すること', () => {
  renderDataTable({ data: createOrders(21), initialGroupingColumnId: null });

  fireEvent.click(screen.getByRole('button', { name: '次のページ' }));

  expect(getBodyRows()).toHaveLength(1);
});

it('次のページを押した場合、次の描画のあとも次のページを描画し続けること', async () => {
  renderDataTable({ data: createOrders(21), initialGroupingColumnId: null });

  fireEvent.click(screen.getByRole('button', { name: '次のページ' }));
  await waitForNextTask();

  expect(getBodyRows()).toHaveLength(1);
});

it('グループ化する列に顧客を選んだ場合、顧客でグループ化すること', () => {
  renderOrders();

  fireEvent.change(screen.getByRole('combobox', { name: 'グループ化する列' }), {
    target: { value: 'customer' },
  });

  expect(screen.getByRole('button', { name: /A社/u })).toHaveTextContent('2 件');
});

it('グループ化しないを選んだ場合、グループ化を解除すること', () => {
  renderGroupedOrders();

  fireEvent.change(screen.getByRole('combobox', { name: 'グループ化する列' }), {
    target: { value: '' },
  });

  expect(getBodyRows()).toHaveLength(3);
});

it('列でグループ化した場合、グループの行に集計の値を描画すること', () => {
  renderGroupedOrders();

  const actual = screen.getByText('合計 5000 円');

  expect(actual).toBeInTheDocument();
});

it('列でグループ化した場合、グループの行に行の合計の列の小計を描画すること', () => {
  renderGroupedOrders();

  const actual = screen.getByText('小計 9 個');

  expect(actual).toBeInTheDocument();
});

it('列でグループ化した場合、集計しない列の値をグループの行に描画しないこと', () => {
  renderGroupedOrders();

  const actual = screen.queryByText(/^注文番号 /u);

  expect(actual).not.toBeInTheDocument();
});

it('列でグループ化した場合、グループの行の選択欄にグループの名前を付けること', () => {
  renderGroupedOrders();

  const actual = screen.getByRole('checkbox', {
    name: 'A社 の注文 2 件を選択',
  });

  expect(actual).toBeInTheDocument();
});

it('列でグループ化した場合、選択欄を先頭の列に置いたままにすること', () => {
  renderGroupedOrders();

  const actual = screen.getAllByRole('columnheader')[0];

  expect(actual).toContainElement(
    screen.getByRole('checkbox', { name: '表示中の注文をすべて選択' })
  );
});

it('グループの見出しを押した場合、グループの中の行を描画すること', () => {
  renderGroupedOrders();

  fireEvent.click(screen.getByRole('button', { name: /A社/u }));

  expect(screen.getByText('3000 円')).toBeInTheDocument();
});

it('グループの見出しを押した場合、次の描画のあともグループを開いたままにすること', async () => {
  renderGroupedOrders();

  fireEvent.click(screen.getByRole('button', { name: /A社/u }));
  await waitForNextTask();

  expect(screen.getByText('3000 円')).toBeInTheDocument();
});

it('列の見出しをまとめた場合、見出しの選択欄を 1 つだけ描画すること', () => {
  renderWithUi(
    <DataTable
      columns={columnHelper.columns([
        columnHelper.group({
          columns: columnHelper.columns([columnHelper.accessor('customer', { header: '顧客' })]),
          header: '取引先',
          id: 'counterparty',
        }),
      ])}
      data={orders}
      getRowId={(order) => order.id}
      hasColumnVisibility
      hasGrouping
      initialGroupingColumnId={null}
      labels={labels}
      selectionActions={() => null}
    />
  );

  const actual = screen.getAllByRole('checkbox', {
    name: '表示中の注文をすべて選択',
  });

  expect(actual).toHaveLength(1);
});

// data は描画をまたいで同じ参照にし、labels だけが新しいオブジェクトになるようにする
const thirtyOrders = createOrders(30);

const RerenderingDataTable = (): React.JSX.Element => {
  const [renderCount, setRenderCount] = useState(0);
  return (
    <>
      <button
        onClick={() => {
          setRenderCount(renderCount + 1);
        }}
        type="button"
      >
        再描画
      </button>
      <DataTable
        columns={columns}
        data={thirtyOrders}
        getRowId={(order) => order.id}
        hasColumnVisibility
        hasGrouping
        initialGroupingColumnId="customer"
        // アプリは labels を描画のたびに作ることが多いため、毎回新しいオブジェクトを渡す
        labels={{ ...labels }}
        selectionActions={() => null}
      />
    </>
  );
};

it('グループ化中に labels が新しいオブジェクトで渡されても、今のページを描画し続けること', async () => {
  renderWithUi(<RerenderingDataTable />);

  fireEvent.click(screen.getByRole('button', { name: '次のページ' }));
  fireEvent.click(screen.getByRole('button', { name: '再描画' }));
  // TanStack Table はページを戻す処理を次のタスクで行うため、それを待ってから確かめる
  await waitForNextTask();

  expect(
    screen.getByText('21〜30件を表示\u{3000}全30件', {
      normalizer: (text) => text,
    })
  ).toBeInTheDocument();
});

it('グループ化している列を、表示する列の選択肢に出さないこと', async () => {
  renderGroupedOrders();

  fireEvent.click(screen.getByRole('button', { name: '表示する列' }));
  await screen.findByRole('checkbox', { name: '状態' });

  // jsdom では開いた一覧が非表示の扱いになることがあるため、非表示の要素も含めて探す
  expect(screen.queryByRole('checkbox', { hidden: true, name: '顧客' })).not.toBeInTheDocument();
});

it('隠した列を、グループ化する列の選択肢に出さないこと', async () => {
  renderOrders();

  fireEvent.click(screen.getByRole('button', { name: '表示する列' }));
  fireEvent.click(await screen.findByRole('checkbox', { name: '状態' }));

  expect(
    within(screen.getByRole('combobox', { name: 'グループ化する列' })).queryByRole('option', {
      name: '状態',
    })
  ).not.toBeInTheDocument();
});

it('空の値がある場合、値の一覧に空の値を出さないこと', async () => {
  renderDataTable({
    data: [...orders, orderWithoutAmount],
    initialGroupingColumnId: null,
  });

  fireEvent.click(screen.getByRole('button', { name: '金額で絞り込む' }));
  await screen.findByRole('checkbox', { name: '1000' });

  expect(screen.queryByRole('checkbox', { name: 'undefined' })).not.toBeInTheDocument();
});

it('数値の値の一覧を、数の小さい順に並べること', async () => {
  renderDataTable({
    data: [...orders, { ...orderWithoutAmount, amount: 10_000, id: '5' }],
    initialGroupingColumnId: null,
  });

  fireEvent.click(screen.getByRole('button', { name: '金額で絞り込む' }));
  const dropdown = (await screen.findByRole('checkbox', { name: '1000' })).closest(
    '.mantine-Popover-dropdown'
  );
  if (!(dropdown instanceof HTMLElement)) {
    throw new TypeError('値の一覧がありません');
  }

  expect(
    // jsdom では開いた直後に一覧が非表示の扱いになるため、非表示の要素も含めて探す
    within(dropdown)
      .getAllByRole('checkbox', { hidden: true })
      .map((checkbox) => (checkbox as HTMLInputElement).labels?.[0]?.textContent)
  ).toStrictEqual(['1000', '2000', '3000', '10000']);
});

it('ほかの条件で見えなくなっても、選んでいる値を値の一覧に残すこと', async () => {
  renderOrders();

  await selectCustomerFilter('A社');
  search('B社');
  fireEvent.click(screen.getByRole('button', { name: '顧客で絞り込む' }));

  expect(await screen.findByRole('checkbox', { hidden: true, name: 'A社' })).toBeInTheDocument();
});

it('文字で絞り込んだ場合、空の値の行を一致とみなさないこと', async () => {
  renderDataTable({
    data: [...orders, { ...orderWithoutAmount, status: undefined }],
    initialGroupingColumnId: null,
  });

  fireEvent.click(screen.getByRole('button', { name: '状態で絞り込む' }));
  fireEvent.change(await screen.findByRole('textbox', { name: '状態' }), {
    target: { value: 'd' },
  });

  expect(screen.queryByText('D社')).not.toBeInTheDocument();
});

it('右に揃える列の場合、値のセルを右に揃えること', () => {
  renderOrders();

  const actual = screen.getByText('3000 円').closest('td');

  expect(actual).toHaveStyle({ textAlign: 'right' });
});

it('1 ページの件数が 20 の場合、表の高さに上限を付けないこと', () => {
  renderOrders();

  const actual = screen.getByRole('table').parentElement?.style.maxHeight;

  expect(actual).toBe('none');
});

it('1 ページの件数にすべてを選んだ場合、表の高さに上限を付けて表の中だけをスクロールさせること', () => {
  renderDataTable({ data: createOrders(200), initialGroupingColumnId: null });

  fireEvent.change(screen.getByRole('combobox', { name: '1 ページの件数' }), {
    target: { value: 'all' },
  });

  expect(screen.getByRole('table').parentElement?.style.maxHeight).not.toBe('none');
});

it('1 ページの件数にすべてを選んだ場合、表の全体の行数を支援技術に伝えること', () => {
  renderDataTable({ data: createOrders(200), initialGroupingColumnId: null });

  fireEvent.change(screen.getByRole('combobox', { name: '1 ページの件数' }), {
    target: { value: 'all' },
  });

  expect(screen.getByRole('table')).toHaveAttribute('aria-rowcount', '202');
});

it('合計の行を、表の中をスクロールしても下端に残すこと', () => {
  renderOrders();

  const actual = within(getTotalRow()).getByText('6000 円').closest('td');

  expect(actual).toHaveStyle({ position: 'sticky' });
});

it('右に揃える列の場合、合計のセルを右に揃えること', () => {
  renderOrders();

  const actual = within(getTotalRow()).getByText('6000 円').closest('td');

  expect(actual).toHaveStyle({ textAlign: 'right' });
});

it('右に揃える列の場合、見出しの中身を右に寄せること', () => {
  renderOrders();

  const actual = within(screen.getByRole('columnheader', { name: /金額/u }))
    .getByRole('button', { name: '金額' })
    .parentElement?.getAttribute('style');

  // Mantine の Group は寄せ方を CSS 変数の --group-justify で持つ
  expect(actual).toContain('--group-justify: flex-end');
});

it('合計の行がない表ですべてを選んだ場合、見出しと本体の行の数を支援技術に伝えること', () => {
  renderWithUi(
    <DataTable
      columns={columnHelper.columns([columnHelper.accessor('customer', { header: '顧客' })])}
      data={createOrders(200)}
      getRowId={(order) => order.id}
      hasColumnVisibility
      hasGrouping
      initialGroupingColumnId={null}
      labels={labels}
      selectionActions={() => null}
    />
  );

  fireEvent.change(screen.getByRole('combobox', { name: '1 ページの件数' }), {
    target: { value: 'all' },
  });

  expect(screen.getByRole('table')).toHaveAttribute('aria-rowcount', '201');
});

it('表示している範囲の文字を、1 ページの件数の入力欄と同じ行の高さにして縦の中央に揃えること', () => {
  renderOrders();

  const actual = screen
    .getByText('1〜3件を表示\u{3000}全3件', { normalizer: (text) => text })
    .getAttribute('style');

  expect(actual).toContain('line-height: calc(2.25rem * var(--mantine-scale))');
});

it('1 ページの件数の入力欄と表示している範囲の文字を、下端で揃えること', () => {
  renderOrders();

  const actual = screen
    .getByText('1〜3件を表示\u{3000}全3件', { normalizer: (text) => text })
    .parentElement?.getAttribute('style');

  // Mantine の Group は揃え方を CSS 変数の --group-align で持つ
  expect(actual).toContain('--group-align: flex-end');
});

it('行を選択した場合、その行のチェックボックスに印を付けること', () => {
  renderOrders();

  fireEvent.click(screen.getByRole('checkbox', { name: '注文 1 を選択' }));

  expect(screen.getByRole('checkbox', { name: '注文 1 を選択' })).toBeChecked();
});

const renderOrdersWithoutOptionalControls = (): void => {
  renderWithUi(
    <DataTable
      columns={columns}
      data={orders}
      getRowId={(order) => order.id}
      hasColumnVisibility={false}
      hasGrouping={false}
      initialGroupingColumnId={null}
      labels={labels}
      selectionActions={null}
    />
  );
};

it('hasGroupingがfalseの場合、グループ化する列を選ぶ欄を描画しないこと', () => {
  renderOrdersWithoutOptionalControls();

  const actual = screen.queryByLabelText('グループ化する列');

  expect(actual).not.toBeInTheDocument();
});

it('hasColumnVisibilityがfalseの場合、表示する列のボタンを描画しないこと', () => {
  renderOrdersWithoutOptionalControls();

  const actual = screen.queryByRole('button', { name: '表示する列' });

  expect(actual).not.toBeInTheDocument();
});

it('selectionActionsがnullの場合、行を選ぶチェックボックスを描画しないこと', () => {
  renderOrdersWithoutOptionalControls();

  const actual = screen.queryByRole('checkbox');

  expect(actual).not.toBeInTheDocument();
});

it('selectionActionsがnullの場合、選択の件数を伝える欄を描画しないこと', () => {
  renderOrdersWithoutOptionalControls();

  const actual = screen.queryByRole('status');

  expect(actual).not.toBeInTheDocument();
});
