import { runCommand } from '@generators/internal/commandRunning';
import { readSourceFiles, runGenerator } from '@generators/internal/generatorRunning';
import { copyProject, createTemporaryDirectory } from '@generators/internal/projectCopying';
import { existsSync } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import nodePath from 'node:path';
import { afterAll, beforeAll, expect, it } from 'vitest';

const collectionAnswers = {
  concept: 'inventory-item',
  kind: 'collection',
  path: '/inventory-items',
};

// 4 種類を、動的な区切りのないパスとあるパスの両方で生成する。inventory-item は generator が作った queries.ts へ、
// shipment は手で書いた queries.ts と mutations.ts（import が一部だけある）へ、todo は
// Todo の参考実装の queries.ts（同じモジュールの import を既に持つ）へ追記する
const generationCases = [
  { answers: collectionAnswers, name: 'collection' },
  {
    answers: { concept: 'inventory-item', kind: 'detail', path: '/inventory-items/[id]' },
    name: 'detail',
  },
  {
    answers: { concept: 'inventory-item', kind: 'form', path: '/inventory-items/new' },
    name: 'form',
  },
  {
    answers: { concept: 'inventory-item', kind: 'blank', path: '/inventory-items/summary' },
    name: 'blank',
  },
  {
    answers: { concept: 'shipment', kind: 'collection', path: '/shipments/[id]/lines' },
    name: '動的な区切りを持つcollection',
  },
  {
    answers: { concept: 'shipment', kind: 'detail', path: '/shipment-overview' },
    name: '動的な区切りを持たないdetail',
  },
  {
    answers: { concept: 'shipment', kind: 'form', path: '/shipments/[id]/edit' },
    name: '動的な区切りを持つform',
  },
  {
    answers: { concept: 'shipment', kind: 'blank', path: '/shipments/[id]/summary' },
    name: '動的な区切りを持つblank',
  },
  {
    answers: { concept: 'todo', kind: 'blank', path: '/todos/[id]/summary' },
    name: '手で書いたqueries.tsへ追記するblank',
  },
];

const handwrittenApiFiles = [
  {
    content:
      "import type { Result } from '@/entities/result';\n\nexport type ShipmentCountResult = Result<number>;\n",
    path: 'src/api/shipment/queries.ts',
  },
  {
    content:
      "import type { ApiFailure } from '@/entities/apiFailure';\n\nexport type ShipmentFailure = ApiFailure;\n",
    path: 'src/api/shipment/mutations.ts',
  },
];

const writeFileIn = async ({
  content,
  directory,
  path,
}: {
  readonly content: string;
  readonly directory: string;
  readonly path: string;
}): Promise<void> => {
  await mkdir(nodePath.dirname(nodePath.resolve(directory, path)), { recursive: true });
  await writeFile(nodePath.resolve(directory, path), content);
};

const layoutPath = 'src/app/layout.tsx';

const layoutTitleCode = "  title: 'Next.js Template',\n";

const rewriteLayoutTitle = async ({
  directory,
  title,
}: {
  readonly directory: string;
  readonly title: string;
}): Promise<void> => {
  const content = await readFile(nodePath.resolve(directory, layoutPath), 'utf8');
  await writeFile(
    nodePath.resolve(directory, layoutPath),
    content.replace(layoutTitleCode, () => title)
  );
};

const copyProjectInto = async (directory: string): Promise<void> => {
  const copyResult = await copyProject(directory);
  if (!copyResult.ok) {
    throw copyResult.error;
  }
};

const generatedDirectory = createTemporaryDirectory();
// 失敗の検査に使うディレクトリ。collection を 1 回だけ生成した状態で、各テストが書き込まれないことを確かめる
const failureDirectory = createTemporaryDirectory();
const templatedLayoutDirectory = createTemporaryDirectory();
const untitledLayoutDirectory = createTemporaryDirectory();
const generationFailures = new Map<string, readonly unknown[]>();
const typeGenerationResults = new Map<
  'typegen',
  { readonly exitCode: number; readonly output: string }
>();

afterAll(async () => {
  await Promise.all(
    [generatedDirectory, failureDirectory, templatedLayoutDirectory, untitledLayoutDirectory].map(
      (directory) => rm(directory, { force: true, recursive: true })
    )
  );
});

beforeAll(async () => {
  await copyProjectInto(generatedDirectory);
  await Promise.all(
    handwrittenApiFiles.map((file) => writeFileIn({ ...file, directory: generatedDirectory }))
  );
  // 入れ子の openGraph.title をアプリの名前と取り違えないことも確かめるため、metadata の title より前に置く
  await rewriteLayoutTitle({
    directory: generatedDirectory,
    title: `  openGraph: { title: '共有用の名前' },\n${layoutTitleCode}`,
  });
  for (const { answers, name } of generationCases) {
    const { failures } = await runGenerator({
      answers,
      destination: generatedDirectory,
      generatorName: 'screen',
    });
    generationFailures.set(name, failures);
  }

  // tsc の検査は next typegen が書く経路の型を読むため、生成の直後に 1 度だけ実行する
  typeGenerationResults.set(
    'typegen',
    await runCommand({
      command: nodePath.resolve(generatedDirectory, 'node_modules', '.bin', 'next'),
      commandArguments: ['typegen'],
      directory: generatedDirectory,
    })
  );

  await copyProjectInto(failureDirectory);
  await runGenerator({
    answers: collectionAnswers,
    destination: failureDirectory,
    generatorName: 'screen',
  });

  await copyProjectInto(templatedLayoutDirectory);
  await rewriteLayoutTitle({
    directory: templatedLayoutDirectory,
    title:
      "  title: {\n    default: 'Next.js Template',\n    template: '%s | Next.js Template',\n  },\n",
  });
  await runGenerator({
    answers: collectionAnswers,
    destination: templatedLayoutDirectory,
    generatorName: 'screen',
  });

  await copyProjectInto(untitledLayoutDirectory);
  await rewriteLayoutTitle({ directory: untitledLayoutDirectory, title: '' });
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
  '$nameの引数でscreenを実行した場合、失敗がないこと',
  ({ name }) => {
    const actual = generationFailures.get(name);

    const expected: readonly unknown[] = [];
    expect(actual).toEqual(expected);
  }
);

it.each([
  {
    kind: 'collection',
    paths: [
      'src/app/inventory-items/page.tsx',
      'src/features/inventory-item/inventory-item-collection-screen/InventoryItemCollectionScreen.tsx',
      'src/features/inventory-item/inventory-item-collection-screen/InventoryItemCollectionScreen.stories.tsx',
      'src/features/inventory-item/inventory-item-collection-screen/inventoryItemCollectionScreen.test.tsx',
      'src/api/inventory-item/queries.ts',
    ],
  },
  {
    kind: 'detail',
    paths: [
      'src/app/inventory-items/[id]/page.tsx',
      'src/features/inventory-item/inventory-item-detail-screen/InventoryItemDetailScreen.tsx',
      'src/features/inventory-item/inventory-item-detail-screen/InventoryItemDetailScreen.stories.tsx',
      'src/features/inventory-item/inventory-item-detail-screen/inventoryItemDetailScreen.test.tsx',
      'src/api/inventory-item/queries.ts',
    ],
  },
  {
    kind: 'blank',
    paths: [
      'src/app/inventory-items/summary/page.tsx',
      'src/features/inventory-item/inventory-item-blank-screen/InventoryItemBlankScreen.tsx',
      'src/features/inventory-item/inventory-item-blank-screen/InventoryItemBlankScreen.stories.tsx',
      'src/features/inventory-item/inventory-item-blank-screen/inventoryItemBlankScreen.test.tsx',
      'src/api/inventory-item/queries.ts',
    ],
  },
  {
    kind: 'form',
    paths: [
      'src/app/inventory-items/new/page.tsx',
      'src/features/inventory-item/inventory-item-form-screen/InventoryItemFormScreen.tsx',
      'src/features/inventory-item/inventory-item-form-screen/InventoryItemFormScreen.stories.tsx',
      'src/features/inventory-item/inventory-item-form-screen/inventoryItemFormScreen.test.tsx',
      'src/features/inventory-item/inventory-item-form-screen/inventoryItemFormValidation.ts',
      'src/features/inventory-item/inventory-item-form-screen/inventoryItemFormValidation.test.ts',
      'src/api/inventory-item/mutations.ts',
    ],
  },
])(
  'kindが$kindの引数でscreenを実行した場合、画面1つ分のファイルがすべてできること',
  ({ paths }) => {
    const actual = paths.filter((path) => existsSync(nodePath.resolve(generatedDirectory, path)));

    expect(actual).toEqual(paths);
  }
);

it.each([
  {
    names: [
      'inventoryItemCollectionQueryOptions',
      'inventoryItemDetailQueryOptions',
      'inventoryItemBlankQueryOptions',
    ],
    path: 'src/api/inventory-item/queries.ts',
  },
  {
    names: [
      'ShipmentCountResult',
      'shipmentCollectionQueryOptions',
      'shipmentDetailQueryOptions',
      'shipmentBlankQueryOptions',
    ],
    path: 'src/api/shipment/queries.ts',
  },
  {
    names: ['ShipmentFailure', 'shipmentFormMutationOptions', 'ShipmentFormValues'],
    path: 'src/api/shipment/mutations.ts',
  },
  {
    names: ['todoListQueryKey', 'todoListQueryOptions', 'todoBlankQueryOptions', 'TodoBlankItem'],
    path: 'src/api/todo/queries.ts',
  },
])(
  '既に$pathがある状態でscreenを実行した場合、既存の定義を残したまま追記されること',
  async ({ names, path }) => {
    const content = await readGeneratedFile(path);

    const actual = names.filter((name) =>
      new RegExp(String.raw`export (const|type) ${name}\b`).test(content)
    );

    expect(actual).toEqual(names);
  }
);

it('既存のimport文があるqueries.tsに追記した場合、同じモジュールからのimport文が1つであること', async () => {
  const content = await readGeneratedFile('src/api/todo/queries.ts');

  const actual = content.split("from '@tanstack/react-query';").length - 1;

  const expected = 1;
  expect(actual, content).toBe(expected);
});

it.each([
  {
    description: 'titleが文字列',
    directory: generatedDirectory,
    titleCode: "title: 'inventory-item の一覧 | Next.js Template',",
  },
  {
    description: 'titleがtemplateを持つ',
    directory: templatedLayoutDirectory,
    titleCode: "title: 'inventory-item の一覧',",
  },
])(
  'layout.tsxのmetadataの$descriptionの場合、pageのtitleがlayoutに合うこと',
  async ({ directory, titleCode }) => {
    const content = await readFile(
      nodePath.resolve(directory, 'src/app/inventory-items/page.tsx'),
      'utf8'
    );

    const actual = content.includes(titleCode);

    const expected = true;
    expect(actual, content).toBe(expected);
  }
);

it('生成した後にnext typegenを実行した場合、終了コードが0であること', () => {
  const result = typeGenerationResults.get('typegen');

  const actual = result?.exitCode;

  const expected = 0;
  expect(actual, result?.output).toBe(expected);
});

it('生成した後にtscを実行した場合、終了コードが0であること', async () => {
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

it('生成した後にtextlintを実行した場合、終了コードが0であること', async () => {
  const { exitCode, output } = await runInGeneratedDirectory({
    command: 'textlint',
    commandArguments: ['src/**/*.tsx'],
  });

  const actual = exitCode;

  const expected = 0;
  expect(actual, output).toBe(expected);
});

const generatedConcepts = ['inventory-item', 'shipment', 'todo'];

// src/features/todo は前方一致の絞り込みのため、Todo の参考実装の src/features/todo-list のテストも走る
const generatedTestFilters = generatedConcepts.flatMap((concept) => [
  `src/features/${concept}`,
  `src/api/${concept}/`,
]);

// storybook の project は生成した story を Chromium で描き、axe の検査を通す
it('生成した後にunitとstorybookのテストを実行した場合、終了コードが0であること', async () => {
  const { exitCode, output } = await runInGeneratedDirectory({
    command: 'vitest',
    commandArguments: [
      'run',
      '--project',
      'unit',
      '--project',
      'storybook',
      ...generatedTestFilters,
    ],
  });

  const actual = exitCode;

  const expected = 0;
  expect(actual, output).toBe(expected);
});

it('layout.tsxのmetadataにtitleがない場合、何も書き込まれないこと', async () => {
  const expected = await readSourceFiles(untitledLayoutDirectory);

  await runGenerator({
    answers: collectionAnswers,
    destination: untitledLayoutDirectory,
    generatorName: 'screen',
  });

  const actual = await readSourceFiles(untitledLayoutDirectory);
  expect(actual).toEqual(expected);
});

it('layout.tsxのmetadataにtitleがない場合、失敗すること', async () => {
  const { failures } = await runGenerator({
    answers: collectionAnswers,
    destination: untitledLayoutDirectory,
    generatorName: 'screen',
  });

  const actual = failures.length > 0;

  const expected = true;
  expect(actual).toBe(expected);
});

const rejectedAnswersCases = [
  { answers: collectionAnswers, description: '同じ引数', existingFile: null },
  {
    answers: { ...collectionAnswers, concept: 'InventoryItem' },
    description: 'kebab-caseでないconcept',
    existingFile: null,
  },
  {
    answers: { ...collectionAnswers, kind: 'table' },
    description: 'kindがtable',
    existingFile: null,
  },
  {
    answers: { ...collectionAnswers, path: 'inventory-items' },
    description: '/で始まらないpath',
    existingFile: null,
  },
  {
    answers: { ...collectionAnswers, path: '/api/inventory-items' },
    description: '/apiで始まるpath',
    existingFile: null,
  },
  {
    answers: { ...collectionAnswers, path: '/orders/[id]/lines/[id]' },
    description: '動的な区切りの名前が重なるpath',
    existingFile: null,
  },
  {
    answers: { concept: 'order', kind: 'collection', path: '/orders' },
    description: 'orderCollectionQueryOptionsを定義済みのqueries.tsがある状態',
    existingFile: {
      content: 'export const orderCollectionQueryOptions = {};\n',
      path: 'src/api/order/queries.ts',
    },
  },
  {
    answers: { concept: 'report', kind: 'blank', path: '/reports' },
    description: '同じ場所にroute.tsがある状態',
    existingFile: {
      content: "export const dynamic = 'force-dynamic';\n",
      path: 'src/app/reports/route.ts',
    },
  },
  {
    answers: { concept: 'company', kind: 'blank', path: '/about' },
    description: 'ルートグループに同じURLのpage.tsxがある状態',
    existingFile: {
      content: 'export default function Page(): null {\n  return null;\n}\n',
      path: 'src/app/(marketing)/about/page.tsx',
    },
  },
  {
    answers: { concept: 'summary', kind: 'blank', path: '/summaries' },
    description: 'ルートグループの同じ場所にroute.tsがある状態',
    existingFile: {
      content: "export const dynamic = 'force-dynamic';\n",
      path: 'src/app/(marketing)/summaries/route.ts',
    },
  },
];

const prepareExistingFile = async (
  existingFile: null | { readonly content: string; readonly path: string }
): Promise<void> => {
  if (existingFile === null) {
    return;
  }

  await writeFileIn({ ...existingFile, directory: failureDirectory });
};

it.each(rejectedAnswersCases)(
  '$descriptionでscreenを実行した場合、失敗すること',
  async ({ answers, existingFile }) => {
    await prepareExistingFile(existingFile);

    const { failures } = await runGenerator({
      answers,
      destination: failureDirectory,
      generatorName: 'screen',
    });

    const actual = failures.length > 0;

    const expected = true;
    expect(actual).toBe(expected);
  }
);

it.each(rejectedAnswersCases)(
  '$descriptionでscreenを実行した場合、何も書き込まれないこと',
  async ({ answers, existingFile }) => {
    await prepareExistingFile(existingFile);
    const expected = await readSourceFiles(failureDirectory);

    await runGenerator({ answers, destination: failureDirectory, generatorName: 'screen' });

    const actual = await readSourceFiles(failureDirectory);
    expect(actual).toEqual(expected);
  }
);

// plop のコマンドの起動と TypeScript の plopfile の読み込みに数秒かかるため、既定の 5 秒より長く待つ
const commandTimeoutMilliseconds = 30_000;

// runCommand は子の標準入力をパイプのまま開いておくため、端末のない呼び出し元と同じ状態で、
// 引数が足りないときに plop の対話が入力を待って止まらないことも確かめる
it.each([
  {
    commandArguments: [
      '--concept',
      'inventory-item',
      '--kind',
      'collection',
      '--path',
      '/inventory-items',
    ],
    description: '同じ引数',
  },
  {
    commandArguments: [
      '--concept',
      'inventory-item',
      '--kind',
      'table',
      '--path',
      '/inventory-items',
    ],
    description: 'kindがtableの引数',
  },
  {
    commandArguments: ['--concept', 'inventory-item', '--path', '/orders'],
    description: '--kindを省いた引数',
  },
])(
  '$descriptionでplopのコマンドからscreenを実行した場合、終了コードが1であること',
  async ({ commandArguments }) => {
    const { exitCode, output } = await runCommand({
      command: nodePath.resolve(failureDirectory, 'node_modules', '.bin', 'plop'),
      commandArguments: ['--plopfile', 'plopfile.ts', 'screen', '--', ...commandArguments],
      directory: failureDirectory,
    });

    const actual = exitCode;

    const expected = 1;
    expect(actual, output).toBe(expected);
  },
  commandTimeoutMilliseconds
);
