import { runCommand } from '@generators/internal/commandRunning';
import { readSourceFiles, runGenerator } from '@generators/internal/generatorRunning';
import { copyProject, createTemporaryDirectory } from '@generators/internal/projectCopying';
import { existsSync } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import nodePath from 'node:path';
import { isDefined } from 'remeda';
import ts from 'typescript';
import { afterAll, beforeAll, expect, it } from 'vitest';

const listAnswers = {
  action: 'list',
  concept: 'inventory-item',
  method: 'GET',
  path: '/api/inventory-items',
};

// 手で書いた概念の usecase・controller・endpoints.ts・route.ts。controller が usecase を作る 3 つの形
// （todo のモジュールの const、invoice の引数のない build 関数、shipment の handler の中の呼び出し）と、
// ブロックの本体の最後で return { … } するファクトリー（invoice）と、1 行で書いた戻り値の型（shipment）と、
// createRequestUsecase を持たない controller（shipment）への追記を確かめる
const handwrittenFiles = [
  {
    content: `import type { ApiFailure } from '@/entities/apiFailure';
import type { Result } from '@/entities/result';
import type { PrintErrorLog } from '@/usecases/api-request/gateways/errorLogGateway';

export const createShipmentUsecase = ({
  gateways,
}: {
  readonly gateways: { readonly printErrorLog: PrintErrorLog };
}): { readonly list: () => Promise<Result<readonly string[], ApiFailure>> } => ({
  list: (): Promise<Result<readonly string[], ApiFailure>> => {
    gateways.printErrorLog(new Error('出荷の一覧はまだ読めません'));
    return Promise.resolve({ ok: true, value: [] });
  },
});
`,
    path: 'src/usecases/shipment/usecase.ts',
  },
  {
    content: `import { z } from 'zod';

import { defineEndpoint } from '@/api/endpoint';

const okStatus = 200;

export const listShipmentEndpoint = defineEndpoint({
  inputSchema: z.object({}).readonly(),
  method: 'GET',
  outputSchema: z.array(z.string()).readonly(),
  path: '/api/shipments',
  successStatus: okStatus,
});
`,
    path: 'src/api/shipment/endpoints.ts',
  },
  {
    content: `import { listShipmentEndpoint } from '@/api/shipment/endpoints';
import { printErrorLog } from '@/gateways/errorLogGateway';
import { createReadingRequestInput } from '@/gateways/requestInputGateway';
import { presentFailure, presentSuccess } from '@/presenters/apiResponsePresenter';
import { createApiRequestUsecase } from '@/usecases/api-request/usecase';
import { createShipmentUsecase } from '@/usecases/shipment/usecase';

export const handleListShipmentRequest = (request: Request): Promise<Response> =>
  createApiRequestUsecase({
    gateways: {
      printErrorLog,
      readRequestInput: createReadingRequestInput({ parameters: Promise.resolve({}), request }),
    },
    presenters: { presentFailure, presentSuccess },
  }).handle({
    endpoint: listShipmentEndpoint,
    execute: createShipmentUsecase({ gateways: { printErrorLog } }).list,
  });
`,
    path: 'src/controllers/shipmentController.ts',
  },
  {
    content: `export { handleListShipmentRequest as GET } from '@/controllers/shipmentController';
`,
    path: 'src/app/api/shipments/route.ts',
  },
  {
    content: `import type { ApiFailure } from '@/entities/apiFailure';
import type { Result } from '@/entities/result';
import type { PrintErrorLog } from '@/usecases/api-request/gateways/errorLogGateway';

export const createInvoiceUsecase = ({
  gateways,
}: {
  readonly gateways: { readonly printErrorLog: PrintErrorLog };
}): {
  readonly list: () => Promise<Result<readonly string[], ApiFailure>>;
} => {
  const emptyInvoices: readonly string[] = [];
  return {
    list: (): Promise<Result<readonly string[], ApiFailure>> => {
      gateways.printErrorLog(new Error('請求書の一覧はまだ読めません'));
      return Promise.resolve({ ok: true, value: emptyInvoices });
    },
  };
};
`,
    path: 'src/usecases/invoice/usecase.ts',
  },
  {
    content: `import { z } from 'zod';

import { defineEndpoint } from '@/api/endpoint';

const okStatus = 200;

export const listInvoiceEndpoint = defineEndpoint({
  inputSchema: z.object({}).readonly(),
  method: 'GET',
  outputSchema: z.array(z.string()).readonly(),
  path: '/api/invoices',
  successStatus: okStatus,
});
`,
    path: 'src/api/invoice/endpoints.ts',
  },
  {
    content: `import { listInvoiceEndpoint } from '@/api/invoice/endpoints';
import { printErrorLog } from '@/gateways/errorLogGateway';
import { createReadingRequestInput } from '@/gateways/requestInputGateway';
import { presentFailure, presentSuccess } from '@/presenters/apiResponsePresenter';
import { createApiRequestUsecase } from '@/usecases/api-request/usecase';
import { createInvoiceUsecase } from '@/usecases/invoice/usecase';

const createRequestUsecase = ({
  parameters,
  request,
}: {
  readonly parameters: Promise<Readonly<Record<string, string>>>;
  readonly request: Request;
}): ReturnType<typeof createApiRequestUsecase> =>
  createApiRequestUsecase({
    gateways: {
      printErrorLog,
      readRequestInput: createReadingRequestInput({ parameters, request }),
    },
    presenters: { presentFailure, presentSuccess },
  });

const buildInvoiceUsecase = (): ReturnType<typeof createInvoiceUsecase> =>
  createInvoiceUsecase({ gateways: { printErrorLog } });

export const handleListInvoiceRequest = (request: Request): Promise<Response> =>
  createRequestUsecase({ parameters: Promise.resolve({}), request }).handle({
    endpoint: listInvoiceEndpoint,
    execute: buildInvoiceUsecase().list,
  });
`,
    path: 'src/controllers/invoiceController.ts',
  },
  {
    content: `export { handleListInvoiceRequest as GET } from '@/controllers/invoiceController';
`,
    path: 'src/app/api/invoices/route.ts',
  },
];

// inventory-item は list・get・create・update・remove の順に生成し、新しいファイル・既存のファイルへの追記・
// 静的なパスと動的なパスの route.ts への別メソッドの追記を、最終の状態で確かめる。残りは手で書いた概念への追記
const generationCases = [
  { answers: listAnswers, name: 'list' },
  {
    answers: {
      action: 'get',
      concept: 'inventory-item',
      method: 'GET',
      path: '/api/inventory-items/{id}',
    },
    name: 'get',
  },
  {
    answers: {
      action: 'create',
      concept: 'inventory-item',
      method: 'POST',
      path: '/api/inventory-items',
    },
    name: 'create',
  },
  {
    answers: {
      action: 'update',
      concept: 'inventory-item',
      method: 'PATCH',
      path: '/api/inventory-items/{id}',
    },
    name: 'update',
  },
  {
    answers: {
      action: 'remove',
      concept: 'inventory-item',
      method: 'DELETE',
      path: '/api/inventory-items/{id}',
    },
    name: 'remove',
  },
  {
    answers: { action: 'get', concept: 'todo', method: 'GET', path: '/api/todos/{id}' },
    name: 'モジュールのconstを持つcontroller',
  },
  {
    answers: { action: 'create', concept: 'shipment', method: 'POST', path: '/api/shipments' },
    name: 'handlerの中で呼ぶcontroller',
  },
  {
    answers: {
      action: 'getSummary',
      concept: 'invoice',
      method: 'GET',
      path: '/api/invoices/{invoiceId}/summary',
    },
    name: 'buildの関数を持つcontroller',
  },
];

const writeFiles = async ({
  destination,
  files,
}: {
  readonly destination: string;
  readonly files: readonly { readonly content: string; readonly path: string }[];
}): Promise<void> => {
  for (const { content, path } of files) {
    await mkdir(nodePath.dirname(nodePath.resolve(destination, path)), { recursive: true });
    await writeFile(nodePath.resolve(destination, path), content);
  }
};

const copyProjectInto = async (destination: string): Promise<void> => {
  const copyResult = await copyProject(destination);
  if (!copyResult.ok) {
    throw copyResult.error;
  }
};

const generatedDirectory = createTemporaryDirectory();
// 失敗の検査に使うディレクトリ。list を 1 回だけ生成した状態で、各テストが書き込まれないことを確かめる
const failureDirectory = createTemporaryDirectory();
const generationFailures = new Map<string, readonly unknown[]>();

// 手で書いた概念の usecase・endpoints.ts が既に持つ操作や定義は、生成の前にここへ控えて既存の状態の証拠にする。
// 決め打ちすると、Todo の参考実装に操作が増減しただけでこのテストが壊れるため
const existingFileContentsByPath = new Map<string, string>();

const captureExistingContent = async ({
  destination,
  path,
}: {
  readonly destination: string;
  readonly path: string;
}): Promise<void> => {
  const absolutePath = nodePath.resolve(destination, path);
  if (existingFileContentsByPath.has(path) || !existsSync(absolutePath)) {
    return;
  }

  existingFileContentsByPath.set(path, await readFile(absolutePath, 'utf8'));
};

afterAll(async () => {
  await rm(generatedDirectory, { force: true, recursive: true });
  await rm(failureDirectory, { force: true, recursive: true });
});

beforeAll(async () => {
  await copyProjectInto(generatedDirectory);
  await writeFiles({ destination: generatedDirectory, files: handwrittenFiles });
  for (const { answers, name } of generationCases) {
    await captureExistingContent({
      destination: generatedDirectory,
      path: `src/usecases/${answers.concept}/usecase.ts`,
    });
    await captureExistingContent({
      destination: generatedDirectory,
      path: `src/api/${answers.concept}/endpoints.ts`,
    });

    const { failures } = await runGenerator({
      answers,
      destination: generatedDirectory,
      generatorName: 'api',
    });
    generationFailures.set(name, failures);
  }

  await copyProjectInto(failureDirectory);
  await runGenerator({ answers: listAnswers, destination: failureDirectory, generatorName: 'api' });
});

const runInGeneratedDirectory = ({
  command,
  commandArguments,
}: {
  readonly command: string;
  readonly commandArguments: readonly string[];
}): Promise<{ readonly exitCode: number; readonly output: string }> =>
  runCommand({
    command: nodePath.resolve(generatedDirectory, 'node_modules', '.bin', command),
    commandArguments,
    directory: generatedDirectory,
  });

const readGeneratedFile = (path: string): Promise<string> =>
  readFile(nodePath.resolve(generatedDirectory, path), 'utf8');

it.each(generationCases.map(({ name }) => ({ name })))(
  '$nameの引数でapiを実行した場合、失敗がないこと',
  ({ name }) => {
    const actual = generationFailures.get(name);

    const expected: readonly unknown[] = [];
    expect(actual).toEqual(expected);
  }
);

it('listの引数でapiを実行した場合、エンドポイント1本分のファイルがすべてできること', () => {
  const paths = [
    'src/api/inventory-item/endpoints.ts',
    'src/usecases/inventory-item/usecase.ts',
    'src/usecases/inventory-item/usecase.test.ts',
    'src/controllers/inventoryItemController.ts',
    'src/controllers/inventoryItemController.test.ts',
    'src/app/api/inventory-items/route.ts',
  ];

  const actual = paths.filter((path) => existsSync(nodePath.resolve(generatedDirectory, path)));

  expect(actual).toEqual(paths);
});

// 並び順は生成の最後に perfectionist がそろえるため、順序を問わない Set で比べる
const listUsecaseOperationNamesInContent = ({
  content,
  factoryName,
  path,
}: {
  readonly content: string;
  readonly factoryName: string;
  readonly path: string;
}): ReadonlySet<string> =>
  new Set(
    ts
      .createSourceFile(path, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
      .statements.filter((statement) => ts.isVariableStatement(statement))
      .flatMap((statement) => statement.declarationList.declarations)
      .filter(
        (declaration) => ts.isIdentifier(declaration.name) && declaration.name.text === factoryName
      )
      .flatMap(({ initializer }) =>
        initializer &&
        ts.isArrowFunction(initializer) &&
        initializer.type &&
        ts.isTypeLiteralNode(initializer.type)
          ? initializer.type.members
          : []
      )
      .flatMap((member) => (member.name && ts.isIdentifier(member.name) ? [member.name.text] : []))
  );

const listUsecaseOperationNames = async ({
  factoryName,
  path,
}: {
  readonly factoryName: string;
  readonly path: string;
}): Promise<ReadonlySet<string>> =>
  listUsecaseOperationNamesInContent({ content: await readGeneratedFile(path), factoryName, path });

it('概念のusecaseがない状態でapiを実行した場合、5つの操作をすべて持つこと', async () => {
  const actual = await listUsecaseOperationNames({
    factoryName: 'createInventoryItemUsecase',
    path: 'src/usecases/inventory-item/usecase.ts',
  });

  const expected = new Set(['create', 'get', 'list', 'remove', 'update']);
  expect(actual).toEqual(expected);
});

it.each([
  { action: 'get', factoryName: 'createTodoUsecase', path: 'src/usecases/todo/usecase.ts' },
  {
    action: 'create',
    factoryName: 'createShipmentUsecase',
    path: 'src/usecases/shipment/usecase.ts',
  },
  {
    action: 'getSummary',
    factoryName: 'createInvoiceUsecase',
    path: 'src/usecases/invoice/usecase.ts',
  },
])(
  '$pathのusecaseに操作を足した場合、既存の操作を残したまま足されること',
  async ({ action, factoryName, path }) => {
    const existingContent = existingFileContentsByPath.get(path);
    if (!isDefined(existingContent)) {
      throw new Error(`${path} の生成前の内容が記録されていません`);
    }

    const actual = await listUsecaseOperationNames({ factoryName, path });

    const expected = new Set([
      ...listUsecaseOperationNamesInContent({ content: existingContent, factoryName, path }),
      action,
    ]);
    expect(actual).toEqual(expected);
  }
);

it.each([
  { controller: 'src/controllers/todoController.ts', executeCode: 'todoUsecase.get' },
  {
    controller: 'src/controllers/invoiceController.ts',
    executeCode: 'buildInvoiceUsecase().getSummary',
  },
  {
    controller: 'src/controllers/shipmentController.ts',
    executeCode: 'createShipmentUsecase({ gateways: { printErrorLog } }).create',
  },
])('$controllerのhandlerがusecaseを既存の作り方で呼ぶこと', async ({ controller, executeCode }) => {
  const content = await readGeneratedFile(controller);

  const actual = content.includes(executeCode);

  const expected = true;
  expect(actual).toBe(expected);
});

// controller は createApiRequestUsecase を包む createRequestUsecase を 1 つだけ持ち、どの handler もそれを使う（todoController と同じ形）
it.each([
  { controller: 'src/controllers/inventoryItemController.ts', count: 1 },
  { controller: 'src/controllers/todoController.ts', count: 1 },
  { controller: 'src/controllers/invoiceController.ts', count: 1 },
  { controller: 'src/controllers/shipmentController.ts', count: 0 },
])(
  '$controllerに追記した場合、createRequestUsecaseの宣言が$count個であること',
  async ({ controller, count }) => {
    const content = await readGeneratedFile(controller);

    const actual = content.split('const createRequestUsecase = ').length - 1;

    const expected = count;
    expect(actual).toBe(expected);
  }
);

// export const の行から名前を抜き出す。findDefinitionConflicts（plopfile.ts）が既存の定義を見つけるのと同じ書式を使う
const listExistingEndpointNames = (content: string): readonly string[] =>
  Array.from(content.matchAll(/export const (\w+Endpoint) /g), ([, name]) => name ?? '');

it.each([
  {
    names: [
      'getInventoryItemEndpoint',
      'createInventoryItemEndpoint',
      'updateInventoryItemEndpoint',
      'removeInventoryItemEndpoint',
    ],
    path: 'src/api/inventory-item/endpoints.ts',
  },
  { names: ['getTodoEndpoint'], path: 'src/api/todo/endpoints.ts' },
  { names: ['createShipmentEndpoint'], path: 'src/api/shipment/endpoints.ts' },
  { names: ['getInvoiceSummaryEndpoint'], path: 'src/api/invoice/endpoints.ts' },
])(
  '既に$pathがある状態でapiを実行した場合、既存の定義を残したまま追記されること',
  async ({ names, path }) => {
    const expected = [
      ...listExistingEndpointNames(existingFileContentsByPath.get(path) ?? ''),
      ...names,
    ];
    const content = await readGeneratedFile(path);

    const actual = listExistingEndpointNames(content);

    expect(actual).toEqual(expected);
  }
);

it('既にcontrollerがある状態でapiを実行した場合、既存のhandlerを残したまま追記されること', async () => {
  const names = [
    'handleListInventoryItemRequest',
    'handleGetInventoryItemRequest',
    'handleCreateInventoryItemRequest',
    'handleUpdateInventoryItemRequest',
    'handleRemoveInventoryItemRequest',
  ];
  const content = await readGeneratedFile('src/controllers/inventoryItemController.ts');

  const actual = names.filter((name) => content.includes(`export const ${name} `));

  expect(actual).toEqual(names);
});

// 並び順は生成の最後に perfectionist がそろえるため、順序を問わない Set で比べる
const listRouteMethods = (content: string): ReadonlySet<string> =>
  new Set(
    Array.from(
      content.matchAll(/\bas (DELETE|GET|PATCH|POST|PUT)\b/g),
      ([, method]) => method ?? ''
    )
  );

it.each([
  { methods: ['GET', 'POST'], path: 'src/app/api/inventory-items/route.ts' },
  { methods: ['DELETE', 'GET', 'PATCH'], path: 'src/app/api/inventory-items/[id]/route.ts' },
  { methods: ['GET', 'PATCH'], path: 'src/app/api/todos/[id]/route.ts' },
  { methods: ['GET', 'POST'], path: 'src/app/api/shipments/route.ts' },
])('$pathに追記した場合、既存のmethodを残したまま追記されること', async ({ methods, path }) => {
  const content = await readGeneratedFile(path);

  const actual = listRouteMethods(content);

  const expected = new Set(methods);
  expect(actual).toEqual(expected);
});

it('生成した後にtscを実行した場合、終了コードが0であること', async () => {
  // tsc は next typegen が書く Route Handler の型を読み、handler の引数が Next.js の決まりに合うかも確かめる
  await runInGeneratedDirectory({ command: 'next', commandArguments: ['typegen'] });
  const { exitCode, output } = await runInGeneratedDirectory({
    command: 'tsc',
    commandArguments: ['--noEmit'],
  });

  const actual = exitCode;

  const expected = 0;
  expect(actual, output).toBe(expected);
});

it('生成した後にESLintを実行した場合、終了コードが0であること', async () => {
  const { exitCode, output } = await runInGeneratedDirectory({
    command: 'eslint',
    commandArguments: ['src'],
  });

  const actual = exitCode;

  const expected = 0;
  expect(actual, output).toBe(expected);
});

it('生成した後にPrettierの検査を実行した場合、終了コードが0であること', async () => {
  const { exitCode, output } = await runInGeneratedDirectory({
    command: 'prettier',
    commandArguments: ['--check', 'src'],
  });

  const actual = exitCode;

  const expected = 0;
  expect(actual, output).toBe(expected);
});

it('生成した後にdependency-cruiserを実行した場合、終了コードが0であること', async () => {
  const { exitCode, output } = await runInGeneratedDirectory({
    command: 'depcruise',
    commandArguments: ['src', 'packages'],
  });

  const actual = exitCode;

  const expected = 0;
  expect(actual, output).toBe(expected);
});

// packages の規則はプロジェクトの中のパス（packages/ui/src/…）で書かれているため、写した先で元のプロジェクトの実体に
// 解決されると規則が効かなくなる
it('写した先でdependency-cruiserがpackagesをプロジェクトの中のパスで解決すること', async () => {
  const { output } = await runInGeneratedDirectory({
    command: 'depcruise',
    commandArguments: ['src/features/todo-list', '--output-type', 'json'],
  });

  const actual = output.includes(
    '"source": "packages/ui/src/blocks/collection-skeleton/CollectionSkeleton.tsx"'
  );

  const expected = true;
  expect(actual, output).toBe(expected);
});

const generatedConcepts = [
  { camelCase: 'inventoryItem', kebabCase: 'inventory-item' },
  { camelCase: 'todo', kebabCase: 'todo' },
  { camelCase: 'shipment', kebabCase: 'shipment' },
  { camelCase: 'invoice', kebabCase: 'invoice' },
];

it('生成した後に生成したファイルのテストを実行した場合、終了コードが0であること', async () => {
  const { exitCode, output } = await runInGeneratedDirectory({
    command: 'vitest',
    commandArguments: [
      'run',
      '--project',
      'unit',
      ...generatedConcepts.flatMap(({ camelCase, kebabCase }) => [
        `src/api/${kebabCase}/`,
        `src/usecases/${kebabCase}/`,
        `src/controllers/${camelCase}Controller`,
      ]),
    ],
  });

  const actual = exitCode;

  const expected = 0;
  expect(actual, output).toBe(expected);
});

it('同じ引数でapiをもう一度実行した場合、失敗すること', async () => {
  const { failures } = await runGenerator({
    answers: listAnswers,
    destination: failureDirectory,
    generatorName: 'api',
  });

  const actual = failures.length > 0;

  const expected = true;
  expect(actual).toBe(expected);
});

it('同じ引数でapiをもう一度実行した場合、既存のファイルの中身が変わらないこと', async () => {
  const expected = await readSourceFiles(failureDirectory);

  await runGenerator({ answers: listAnswers, destination: failureDirectory, generatorName: 'api' });

  const actual = await readSourceFiles(failureDirectory);
  expect(actual).toEqual(expected);
});

const invalidAnswersCases = [
  {
    answers: { ...listAnswers, concept: 'InventoryItem' },
    description: 'conceptがkebab-caseでない',
  },
  { answers: { ...listAnswers, method: 'FETCH' }, description: 'methodがFETCH' },
  { answers: { ...listAnswers, path: 'inventory-items' }, description: 'pathが/api/で始まらない' },
  {
    answers: { ...listAnswers, path: '/api/inventory-items/[id]' },
    description: 'pathの動的な区切りが[id]の形',
  },
  {
    answers: { ...listAnswers, path: '/api/inventory-items/{id}/parts/{id}' },
    description: 'pathの動的な区切りの名前が重なる',
  },
  {
    answers: {
      ...listAnswers,
      action: 'delete',
      method: 'DELETE',
      path: '/api/inventory-items/{id}',
    },
    description: 'actionの先頭の語がdelete',
  },
  {
    answers: { ...listAnswers, action: 'readItem', path: '/api/inventory-items/{id}' },
    description: 'actionの先頭の語がread',
  },
  {
    answers: { ...listAnswers, action: 'listInventoryItems', path: '/api/inventory-item-lists' },
    description: 'actionが概念の名前を含む',
  },
];

it.each(invalidAnswersCases)(
  '$descriptionの引数でapiを実行した場合、失敗すること',
  async ({ answers }) => {
    const { failures } = await runGenerator({
      answers,
      destination: failureDirectory,
      generatorName: 'api',
    });

    const actual = failures.length > 0;

    const expected = true;
    expect(actual).toBe(expected);
  }
);

it.each(invalidAnswersCases)(
  '$descriptionの引数でapiを実行した場合、何も書き込まれないこと',
  async ({ answers }) => {
    const expected = await readSourceFiles(failureDirectory);

    await runGenerator({ answers, destination: failureDirectory, generatorName: 'api' });

    const actual = await readSourceFiles(failureDirectory);
    expect(actual).toEqual(expected);
  }
);

const existingFileCases = [
  {
    answers: { action: 'count', concept: 'todo', method: 'GET', path: '/api/todos' },
    description: '既にGETをexportする/api/todosへのGET',
    existingFiles: [],
  },
  {
    answers: { action: 'create', concept: 'order', method: 'POST', path: '/api/orders' },
    description: 'handlerの書き出し以外の文を持つroute.tsがある状態',
    existingFiles: [
      { content: "export const dynamic = 'force-dynamic';\n", path: 'src/app/api/orders/route.ts' },
    ],
  },
  {
    answers: {
      action: 'list',
      concept: 'todo-note',
      method: 'GET',
      path: '/api/todos/{todoId}/notes',
    },
    description: '既存の[id]と名前が食い違う動的な区切り',
    existingFiles: [],
  },
  {
    answers: { action: 'list', concept: 'todo', method: 'GET', path: '/api/todos/summary' },
    description: '既にある操作と同じ名前',
    existingFiles: [],
  },
  {
    answers: { action: 'list', concept: 'payment', method: 'GET', path: '/api/payments' },
    description: 'ファクトリーがないusecase.ts',
    existingFiles: [
      {
        content: 'export const paymentOperations = {};\n',
        path: 'src/usecases/payment/usecase.ts',
      },
    ],
  },
  {
    answers: { action: 'get', concept: 'receipt', method: 'GET', path: '/api/receipts/{id}' },
    description: '戻り値の型がオブジェクトの型でないファクトリー',
    existingFiles: [
      {
        content:
          'type ReceiptOperations = { readonly list: () => null };\n\nexport const createReceiptUsecase = (): ReceiptOperations => ({ list: (): null => null });\n',
        path: 'src/usecases/receipt/usecase.ts',
      },
    ],
  },
  {
    answers: { action: 'list', concept: 'refund', method: 'GET', path: '/api/refunds' },
    description: 'gatewaysを受け取るのにcontrollerに呼び出しがないファクトリー',
    existingFiles: [
      {
        content:
          'export const createRefundUsecase = ({ gateways }: { readonly gateways: { readonly readRefund: () => string } }): { readonly get: () => string } => ({ get: (): string => gateways.readRefund() });\n',
        path: 'src/usecases/refund/usecase.ts',
      },
    ],
  },
];

// 何も書き込まれないことを先に確かめる。失敗の検査を先に走らせると、誤って書き込んだ後の 2 回目の実行が既存のファイルと重なって失敗し、書き込みを見逃すため
it.each(existingFileCases)(
  '$descriptionでapiを実行した場合、何も書き込まれないこと',
  async ({ answers, existingFiles }) => {
    await writeFiles({ destination: failureDirectory, files: existingFiles });
    const expected = await readSourceFiles(failureDirectory);

    await runGenerator({ answers, destination: failureDirectory, generatorName: 'api' });

    const actual = await readSourceFiles(failureDirectory);
    expect(actual).toEqual(expected);
  }
);

it.each(existingFileCases)(
  '$descriptionでapiを実行した場合、失敗すること',
  async ({ answers, existingFiles }) => {
    await writeFiles({ destination: failureDirectory, files: existingFiles });

    const { failures } = await runGenerator({
      answers,
      destination: failureDirectory,
      generatorName: 'api',
    });

    const actual = failures.length > 0;

    const expected = true;
    expect(actual).toBe(expected);
  }
);

const listCommandArguments = [
  '--concept',
  'inventory-item',
  '--action',
  'list',
  '--method',
  'GET',
  '--path',
  '/api/inventory-items',
];

// plop のコマンドの起動と TypeScript の plopfile の読み込みに数秒かかるため、既定の 5 秒より長く待つ
const commandTimeoutMilliseconds = 30_000;

// runCommand は子の標準入力をパイプのまま開いておくため、端末のない呼び出し元と同じ状態で、
// 引数が足りないときに plop の対話が入力を待って止まらないことも確かめる
it.each([
  { commandArguments: listCommandArguments, description: '同じ引数' },
  {
    commandArguments: listCommandArguments.map((commandArgument) =>
      commandArgument === 'inventory-item' ? 'InventoryItem' : commandArgument
    ),
    description: 'kebab-caseでないconcept',
  },
  {
    commandArguments: listCommandArguments.slice(0, -2),
    description: '--pathを省いた引数',
  },
])(
  '$descriptionでplopのコマンドからapiを実行した場合、終了コードが1であること',
  async ({ commandArguments }) => {
    const { exitCode, output } = await runCommand({
      command: nodePath.resolve(failureDirectory, 'node_modules', '.bin', 'plop'),
      commandArguments: ['--plopfile', 'plopfile.ts', 'api', '--', ...commandArguments],
      directory: failureDirectory,
    });

    const actual = exitCode;

    const expected = 1;
    expect(actual, output).toBe(expected);
  },
  commandTimeoutMilliseconds
);
