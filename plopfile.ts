import type { ActionType, NodePlopAPI } from 'plop';

import { ESLint } from 'eslint';
import perfectionist from 'eslint-plugin-perfectionist';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import nodePath from 'node:path';
import { format, resolveConfig } from 'prettier';
import { isDefined } from 'remeda';
import ts from 'typescript';
import tseslint from 'typescript-eslint';
import { z } from 'zod';

import type { Result } from '@/entities/result';

const conceptSchema = z
  .string()
  .regex(
    /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/,
    'concept は kebab-case（例: inventory-item）で指定してください'
  );

// 先頭の小文字の語を動詞として、エンドポイントと handler の名前の先頭に置くため
const splitAction = (action: string): { readonly rest: string; readonly verb: string } => {
  const verb = action.replace(/[A-Z].*$/s, '');
  return { rest: action.slice(verb.length), verb };
};

// delete は予約語で操作を分割代入できず、read は get と同じ意味で名前が揺れるため、標準の動詞にそろえる
const actionSchema = z
  .string()
  .regex(/^[a-z][a-zA-Z0-9]*$/, 'action は camelCase（例: list、getLatestSet）で指定してください')
  .refine(
    (action) => !['delete', 'read'].includes(splitAction(action).verb),
    'action の先頭の語に delete・read は使えません。remove・get を使ってください'
  );

// ファクトリーが概念の名詞を持つため、操作の名前に概念の名詞を重ねない
const findActionConflicts = ({
  action,
  conceptPascalCase,
}: {
  readonly action: string;
  readonly conceptPascalCase: string;
}): readonly string[] =>
  action.includes(conceptPascalCase)
    ? [
        `action の ${action} が概念の名前 ${conceptPascalCase} を含んでいます。操作の名前からは概念の名詞を省いてください（例: listInventoryItems ではなく list）`,
      ]
    : [];

const methodSchema = z.enum(['DELETE', 'GET', 'PATCH', 'POST', 'PUT'], {
  error: 'method は GET・POST・PUT・PATCH・DELETE のどれかで指定してください',
});

// エンドポイントの定義は動的な区切りを {id} で書き、Route Handler のディレクトリは Next.js の決まりで [id] と書くため
const endpointParameterPattern = /\{([a-zA-Z0-9]+)\}/g;

// 画面のパスは Next.js の決まりどおり動的な区切りを [id] と書く
const dynamicSegmentPattern = /\[([a-zA-Z0-9]+)\]/g;

const listParameterNames = ({
  path,
  pattern,
}: {
  readonly path: string;
  readonly pattern: RegExp;
}): readonly string[] =>
  Array.from(path.matchAll(pattern), ([, name]) => name).filter((name) => isDefined(name));

// 同じ名前の動的な区切りが 2 つあると、Next.js が経路を組み立てられず、params の値も 1 つに潰れるため
const hasUniqueParameterNames = ({
  path,
  pattern,
}: {
  readonly path: string;
  readonly pattern: RegExp;
}): boolean => {
  const parameterNames = listParameterNames({ path, pattern });
  return new Set(parameterNames).size === parameterNames.length;
};

const duplicateParameterNamesMessage =
  'path の動的な区切りの名前が重なっています。区切りごとに別の名前にしてください';

const endpointPathSchema = z
  .string()
  .regex(
    /^\/api(\/([a-z0-9]+(-[a-z0-9]+)*|\{[a-z][a-zA-Z0-9]*\}))+$/,
    'path は /api/ で始まり、kebab-case の区切りと {camelCase} の動的な区切りだけからなるパス（例: /api/inventory-items/{id}）で指定してください'
  )
  .refine(
    (path) => hasUniqueParameterNames({ path, pattern: endpointParameterPattern }),
    duplicateParameterNamesMessage
  );

const apiAnswersSchema = z.object({
  action: actionSchema,
  concept: conceptSchema,
  method: methodSchema,
  path: endpointPathSchema,
});

type ApiAnswers = z.infer<typeof apiAnswersSchema>;

type ApiFilePaths = {
  readonly controller: string;
  readonly controllerTest: string;
  readonly endpoints: string;
  readonly route: string;
  readonly usecase: string;
  readonly usecaseTest: string;
};

type ApiNames = {
  readonly conceptPascalCase: string;
  readonly controllerFileName: string;
  readonly endpointName: string;
  readonly handlerName: string;
  readonly usecaseFactoryName: string;
};

type ApiTemplateData = {
  readonly concept: string;
  readonly controllerFileName: string;
  readonly endpointName: string;
  readonly handlerName: string;
  readonly hasParameters: boolean;
  readonly hasRequestUsecaseBuilder: boolean;
  readonly inputSchemaCode: string;
  readonly method: HttpMethod;
  readonly operationName: string;
  readonly outputSchemaCode: string;
  readonly parametersTypeCode: string;
  readonly path: string;
  readonly requestInitCode: string;
  readonly sampleParametersCode: string;
  readonly samplePath: string;
  readonly shouldAddRequestUsecaseBuilder: boolean;
  readonly shouldDeclareStatusConstant: boolean;
  readonly statusConstantName: string;
  readonly successStatus: number;
  readonly usecaseConstructionCode: string;
  readonly usecaseDirectory: string;
  readonly usecaseExpressionCode: string;
  readonly usecaseFactoryName: string;
};

type HttpMethod = z.infer<typeof methodSchema>;

type NamedImport = {
  readonly isType: boolean;
  readonly module: string;
  readonly name: string;
};

type TextInsertion = {
  readonly needsSeparator: boolean;
  readonly position: number;
};

type UsecaseFactory = {
  readonly dependencies: null | {
    readonly gateways: readonly string[];
    readonly presenters: readonly string[];
  };
  readonly objectInsertion: TextInsertion;
  readonly operationNames: readonly string[];
  readonly returnTypeInsertion: TextInsertion;
};

const createValidating =
  (schema: z.ZodType): ((value: unknown) => string | true) =>
  (value: unknown): string | true => {
    const parsed = schema.safeParse(value);
    return parsed.success ? true : z.prettifyError(parsed.error);
  };

const capitalize = (word: string): string => `${word.charAt(0).toUpperCase()}${word.slice(1)}`;

const decapitalize = (word: string): string => `${word.charAt(0).toLowerCase()}${word.slice(1)}`;

const toPascalCaseFromKebabCase = (kebabCase: string): string =>
  kebabCase
    .split('-')
    .map((word) => capitalize(word))
    .join('');

const okStatus = 200;
const createdStatus = 201;
const noContentStatus = 204;

// 成功のステータスは endpoints.ts の中で名前のある const として 1 回だけ宣言し、同じメソッドの定義で使い回すため
const successStatusByMethod: Readonly<
  Record<HttpMethod, { readonly constantName: string; readonly status: number }>
> = {
  DELETE: { constantName: 'noContentStatus', status: noContentStatus },
  GET: { constantName: 'okStatus', status: okStatus },
  PATCH: { constantName: 'okStatus', status: okStatus },
  POST: { constantName: 'createdStatus', status: createdStatus },
  PUT: { constantName: 'okStatus', status: okStatus },
};

const bodylessMethods: ReadonlySet<HttpMethod> = new Set(['DELETE', 'GET']);

// 動的な区切りの値に "/" を含めた例で、エンコードした URL でも handler まで届くことを controller のテストで確かめる
const sampleParameterValue = 'a/b';

const buildObjectCode = (fields: readonly string[]): string => `{ ${fields.join(', ')} }`;

const buildSampleParametersCode = (parameterNames: readonly string[]): string =>
  buildObjectCode(parameterNames.map((name) => `${name}: ${JSON.stringify(sampleParameterValue)}`));

// 空の動的な区切りは Route Handler まで届かず別の経路になるため、1 文字以上を求める
const buildInputSchemaCode = ({
  hasBody,
  parameterNames,
}: {
  readonly hasBody: boolean;
  readonly parameterNames: readonly string[];
}): string =>
  `z.object(${buildObjectCode([
    ...(hasBody ? ['body: z.object({}).readonly()'] : []),
    ...(parameterNames.length === 0
      ? []
      : [
          `parameters: z.object(${buildObjectCode(parameterNames.map((name) => `${name}: z.string().min(1)`))}).readonly()`,
        ]),
  ])}).readonly()`;

const buildRequestInitCode = (method: HttpMethod): string => {
  if (method === 'GET') {
    return '';
  }

  return bodylessMethods.has(method)
    ? `, { method: '${method}' }`
    : `, { body: '{}', method: '${method}' }`;
};

// 204 の応答は本文を持たず、requestEndpoint は本文のない応答を null として読むため、DELETE の出力は null にする
const buildOutputSchemaCode = (method: HttpMethod): string =>
  method === 'DELETE' ? 'z.null()' : 'z.object({}).readonly()';

const buildApiNames = (answers: ApiAnswers): ApiNames => {
  const conceptPascalCase = toPascalCaseFromKebabCase(answers.concept);
  const { rest, verb } = splitAction(answers.action);
  return {
    conceptPascalCase,
    controllerFileName: `${decapitalize(conceptPascalCase)}Controller`,
    endpointName: `${verb}${conceptPascalCase}${rest}Endpoint`,
    handlerName: `handle${capitalize(verb)}${conceptPascalCase}${rest}Request`,
    usecaseFactoryName: `create${conceptPascalCase}Usecase`,
  };
};

const toRouteDirectory = (path: string): string =>
  path.replaceAll(endpointParameterPattern, '[$1]');

const buildFilePaths = ({
  answers,
  names,
}: {
  readonly answers: ApiAnswers;
  readonly names: ApiNames;
}): ApiFilePaths => {
  const usecaseDirectory = `src/usecases/${answers.concept}`;
  const controllerBase = `src/controllers/${names.controllerFileName}`;
  return {
    controller: `${controllerBase}.ts`,
    controllerTest: `${controllerBase}.test.ts`,
    endpoints: `src/api/${answers.concept}/endpoints.ts`,
    route: `src/app${toRouteDirectory(answers.path)}/route.ts`,
    usecase: `${usecaseDirectory}/usecase.ts`,
    usecaseTest: `${usecaseDirectory}/usecase.test.ts`,
  };
};

// controller が createApiRequestUsecase を包む createRequestUsecase を持つとき、新しい handler もそれを使う。
// 新しい controller には todoController と同じ形でそれを作り、手で書いて持たない controller では handler の中で直に呼ぶ
const requestUsecaseBuilderPattern = /^const createRequestUsecase = /m;

const buildTemplateData = ({
  answers,
  controllerContent,
  endpointsContent,
  names,
  usecaseConstructionCode,
  usecaseExpressionCode,
}: {
  readonly answers: ApiAnswers;
  readonly controllerContent: null | string;
  readonly endpointsContent: null | string;
  readonly names: ApiNames;
  readonly usecaseConstructionCode: string;
  readonly usecaseExpressionCode: string;
}): ApiTemplateData => {
  const parameterNames = listParameterNames({
    path: answers.path,
    pattern: endpointParameterPattern,
  });
  const { constantName, status } = successStatusByMethod[answers.method];
  const shouldAddRequestUsecaseBuilder = controllerContent === null;
  return {
    concept: answers.concept,
    controllerFileName: names.controllerFileName,
    endpointName: names.endpointName,
    handlerName: names.handlerName,
    hasParameters: parameterNames.length > 0,
    hasRequestUsecaseBuilder:
      shouldAddRequestUsecaseBuilder || requestUsecaseBuilderPattern.test(controllerContent),
    inputSchemaCode: buildInputSchemaCode({
      hasBody: !bodylessMethods.has(answers.method),
      parameterNames,
    }),
    method: answers.method,
    operationName: answers.action,
    outputSchemaCode: buildOutputSchemaCode(answers.method),
    parametersTypeCode: buildObjectCode(parameterNames.map((name) => `readonly ${name}: string`)),
    path: answers.path,
    requestInitCode: buildRequestInitCode(answers.method),
    sampleParametersCode: buildSampleParametersCode(parameterNames),
    samplePath: answers.path.replaceAll(endpointParameterPattern, () =>
      encodeURIComponent(sampleParameterValue)
    ),
    shouldAddRequestUsecaseBuilder,
    shouldDeclareStatusConstant: !new RegExp(`^const ${constantName} = `, 'm').test(
      endpointsContent ?? ''
    ),
    statusConstantName: constantName,
    successStatus: status,
    usecaseConstructionCode,
    usecaseDirectory: answers.concept,
    usecaseExpressionCode,
    usecaseFactoryName: names.usecaseFactoryName,
  };
};

// 生成する操作は、つなぐまで画面や呼び出し元が失敗を出すよう、未実装を失敗として返す
const notImplementedOperationTypeCode = '() => Promise<Result<never, ApiFailure>>';
const notImplementedOperationCode =
  "(): Promise<Result<never, ApiFailure>> => Promise.resolve({ error: { kind: 'internal', message: 'この機能はまだ実装されていません' }, ok: false })";

// 新しい概念のモジュールも、既存のモジュールへの追記と同じ AST の挿入を通すため、操作のない形から始める
const usecaseSkeletonCode = ({ factoryName }: { readonly factoryName: string }): string =>
  `export const ${factoryName} = (): {\n} => ({\n});\n`;

const parseTypeScript = ({
  content,
  path,
}: {
  readonly content: string;
  readonly path: string;
}): ts.SourceFile =>
  ts.createSourceFile(path, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

const listTopLevelVariableDeclarations = ({
  isExportedOnly,
  sourceFile,
}: {
  readonly isExportedOnly: boolean;
  readonly sourceFile: ts.SourceFile;
}): readonly ts.VariableDeclaration[] =>
  sourceFile.statements
    .filter((statement) => ts.isVariableStatement(statement))
    .filter(
      (statement) =>
        !isExportedOnly ||
        (statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) ??
          false)
    )
    .flatMap((statement) => [...statement.declarationList.declarations]);

const listDeclarationNames = (
  declarations: readonly (ts.ObjectLiteralElementLike | ts.TypeElement)[]
): readonly string[] =>
  declarations.flatMap(({ name }) => (isDefined(name) && ts.isIdentifier(name) ? [name.text] : []));

const findReturnedObjectInBlock = (body: ts.ConciseBody): null | ts.ObjectLiteralExpression => {
  if (!ts.isBlock(body)) {
    return null;
  }

  const lastStatement = body.statements.at(-1);
  return isDefined(lastStatement) &&
    ts.isReturnStatement(lastStatement) &&
    isDefined(lastStatement.expression) &&
    ts.isObjectLiteralExpression(lastStatement.expression)
    ? lastStatement.expression
    : null;
};

const findReturnedObject = (body: ts.ConciseBody): null | ts.ObjectLiteralExpression =>
  ts.isParenthesizedExpression(body) && ts.isObjectLiteralExpression(body.expression)
    ? body.expression
    : findReturnedObjectInBlock(body);

// 1 行で書かれた型（{ readonly check: () => Promise<Response> }）は最後のメンバーが区切りを持たないため、足す前に区切りが要る
const findReturnTypeInsertion = (typeLiteral: ts.TypeLiteralNode): TextInsertion => {
  const lastMember = typeLiteral.members.at(-1);
  return isDefined(lastMember)
    ? { needsSeparator: !/[;,]$/.test(lastMember.getText()), position: lastMember.getEnd() }
    : { needsSeparator: false, position: typeLiteral.getEnd() - 1 };
};

// オブジェクトのリテラルのプロパティは区切りの , を含まないため、プロパティがあれば足す前に区切りが要る
const findObjectInsertion = (objectLiteral: ts.ObjectLiteralExpression): TextInsertion => {
  const lastProperty = objectLiteral.properties.at(-1);
  return isDefined(lastProperty)
    ? { needsSeparator: true, position: lastProperty.getEnd() }
    : { needsSeparator: false, position: objectLiteral.getEnd() - 1 };
};

const usecaseDependencyKeys: ReadonlySet<string> = new Set(['gateways', 'presenters']);

const readUsecaseDependency = (
  member: ts.TypeElement
): null | { readonly key: string; readonly names: readonly string[] } =>
  ts.isPropertySignature(member) &&
  ts.isIdentifier(member.name) &&
  usecaseDependencyKeys.has(member.name.text) &&
  isDefined(member.type) &&
  ts.isTypeLiteralNode(member.type)
    ? { key: member.name.text, names: listDeclarationNames(member.type.members) }
    : null;

const findUsecaseDependencyTypeLiteral = (
  parameters: readonly ts.ParameterDeclaration[]
): null | ts.TypeLiteralNode => {
  const [parameter, ...otherParameters] = parameters;
  return isDefined(parameter) &&
    otherParameters.length === 0 &&
    ts.isObjectBindingPattern(parameter.name) &&
    isDefined(parameter.type) &&
    ts.isTypeLiteralNode(parameter.type)
    ? parameter.type
    : null;
};

// usecase のテストで各 gateway・presenter に vi.fn() を渡してファクトリーを作るため、引数の型から名前を読む
const readUsecaseDependencies = ({
  factoryName,
  parameters,
  path,
}: {
  readonly factoryName: string;
  readonly parameters: readonly ts.ParameterDeclaration[];
  readonly path: string;
}): Result<UsecaseFactory['dependencies']> => {
  if (parameters.length === 0) {
    return { ok: true, value: null };
  }

  const failure = {
    error: new Error(
      `${path} の ${factoryName} の引数が { gateways, presenters } の形でないため、テストで usecase を作れません`
    ),
    ok: false,
  } as const;
  const typeLiteral = findUsecaseDependencyTypeLiteral(parameters);
  if (typeLiteral === null) {
    return failure;
  }

  const dependencies = typeLiteral.members
    .map((member) => readUsecaseDependency(member))
    .filter((dependency) => dependency !== null);
  if (dependencies.length !== typeLiteral.members.length) {
    return failure;
  }

  return {
    ok: true,
    value: {
      gateways: dependencies.find(({ key }) => key === 'gateways')?.names ?? [],
      presenters: dependencies.find(({ key }) => key === 'presenters')?.names ?? [],
    },
  };
};

const createUsecaseFactoryFailure = (
  message: string
): { readonly error: Error; readonly ok: false } => ({
  error: new Error(message),
  ok: false,
});

const findFactoryInitializer = ({
  content,
  factoryName,
  path,
}: {
  readonly content: string;
  readonly factoryName: string;
  readonly path: string;
}): Result<ts.ArrowFunction> => {
  const initializer = listTopLevelVariableDeclarations({
    isExportedOnly: true,
    sourceFile: parseTypeScript({ content, path }),
  }).find(({ name }) => ts.isIdentifier(name) && name.text === factoryName)?.initializer;
  if (!isDefined(initializer)) {
    return createUsecaseFactoryFailure(
      `${path} に export const ${factoryName} がないため、操作を足せません。ファクトリーを ${factoryName} という名前で export してください`
    );
  }

  return ts.isArrowFunction(initializer)
    ? { ok: true, value: initializer }
    : createUsecaseFactoryFailure(
        `${path} の ${factoryName} がアロー関数でないため、操作を足せません`
      );
};

const findUsecaseFactory = ({
  content,
  factoryName,
  path,
}: {
  readonly content: string;
  readonly factoryName: string;
  readonly path: string;
}): Result<UsecaseFactory> => {
  const initializerResult = findFactoryInitializer({ content, factoryName, path });
  if (!initializerResult.ok) {
    return initializerResult;
  }

  const returnType = initializerResult.value.type;
  if (!isDefined(returnType) || !ts.isTypeLiteralNode(returnType)) {
    return createUsecaseFactoryFailure(
      `${path} の ${factoryName} の戻り値の型がオブジェクトの型（{ … }）で書かれていないため、操作を足す場所を決められません`
    );
  }

  const returnedObject = findReturnedObject(initializerResult.value.body);
  if (returnedObject === null) {
    return createUsecaseFactoryFailure(
      `${path} の ${factoryName} が返す値がオブジェクトのリテラルでないため、操作を足す場所を決められません（=> ({ … }) か、最後の return { … } にしてください）`
    );
  }

  const dependencies = readUsecaseDependencies({
    factoryName,
    parameters: initializerResult.value.parameters,
    path,
  });
  if (!dependencies.ok) {
    return dependencies;
  }

  return {
    ok: true,
    value: {
      dependencies: dependencies.value,
      objectInsertion: findObjectInsertion(returnedObject),
      operationNames: [
        ...new Set([
          ...listDeclarationNames(returnType.members),
          ...listDeclarationNames(returnedObject.properties),
        ]),
      ],
      returnTypeInsertion: findReturnTypeInsertion(returnType),
    },
  };
};

const insertText = ({
  content,
  position,
  text,
}: {
  readonly content: string;
  readonly position: number;
  readonly text: string;
}): string => `${content.slice(0, position)}${text}${content.slice(position)}`;

// 返すオブジェクトは戻り値の型より後ろにあり、前を先に変えると後ろの位置がずれるため、返すオブジェクトから先に差し込む
const insertUsecaseOperation = ({
  content,
  factory,
  operationCode,
  operationName,
  operationTypeCode,
}: {
  readonly content: string;
  readonly factory: UsecaseFactory;
  readonly operationCode: string;
  readonly operationName: string;
  readonly operationTypeCode: string;
}): string =>
  insertText({
    content: insertText({
      content,
      position: factory.objectInsertion.position,
      text: `${factory.objectInsertion.needsSeparator ? ',' : ''} ${operationName}: ${operationCode}`,
    }),
    position: factory.returnTypeInsertion.position,
    text: `${factory.returnTypeInsertion.needsSeparator ? ';' : ''} readonly ${operationName}: ${operationTypeCode};`,
  });

const isCallTo = ({
  name,
  node,
}: {
  readonly name: string;
  readonly node: ts.Node | undefined;
}): boolean =>
  isDefined(node) &&
  ts.isCallExpression(node) &&
  ts.isIdentifier(node.expression) &&
  node.expression.text === name;

const listDescendants = (node: ts.Node): readonly ts.Node[] => {
  const children: ts.Node[] = [];
  ts.forEachChild(node, (child) => {
    children.push(child);
  });
  return [node, ...children.flatMap((child) => listDescendants(child))];
};

const listBindingNames = (name: ts.BindingName): readonly string[] =>
  ts.isIdentifier(name)
    ? [name.text]
    : name.elements.flatMap((element) =>
        ts.isBindingElement(element) ? listBindingNames(element.name) : []
      );

const listBoundNames = (node: ts.Node): readonly string[] =>
  listDescendants(node).flatMap((descendant) =>
    ts.isVariableDeclaration(descendant) || ts.isParameter(descendant)
      ? listBindingNames(descendant.name)
      : []
  );

const listEnclosingFunctionBoundNames = (node: ts.Node): readonly string[] => {
  if (ts.isSourceFile(node)) {
    return [];
  }

  return [
    ...(ts.isFunctionLike(node) ? listBoundNames(node) : []),
    ...listEnclosingFunctionBoundNames(node.parent),
  ];
};

const isReferenceIdentifier = (node: ts.Node): node is ts.Identifier =>
  ts.isIdentifier(node) &&
  !(ts.isPropertyAccessExpression(node.parent) && node.parent.name === node) &&
  !(ts.isPropertyAssignment(node.parent) && node.parent.name === node);

// 新しい handler が持つ名前は request と context だけで、async でもないため、ほかの handler の引数や局所の名前（context など）や
// await を使う呼び出しを写すと、新しい handler が型検査を通らない
const isPortableCall = (call: ts.CallExpression): boolean => {
  const callBoundNames = new Set(listBoundNames(call));
  const handlerLocalNames = new Set(
    listEnclosingFunctionBoundNames(call.parent).filter(
      (name) => name !== 'request' && !callBoundNames.has(name)
    )
  );
  return listDescendants(call).every(
    (node) =>
      !ts.isAwaitExpression(node) &&
      !(isReferenceIdentifier(node) && handlerLocalNames.has(node.text))
  );
};

const listCallExpressions = ({
  name,
  sourceFile,
}: {
  readonly name: string;
  readonly sourceFile: ts.SourceFile;
}): readonly ts.CallExpression[] =>
  listDescendants(sourceFile).flatMap((node) =>
    ts.isCallExpression(node) && isCallTo({ name, node }) ? [node] : []
  );

const findUsecaseVariableCode = ({
  declarations,
  factoryName,
}: {
  readonly declarations: readonly ts.VariableDeclaration[];
  readonly factoryName: string;
}): null | string =>
  declarations
    .find(
      ({ initializer, name }) =>
        ts.isIdentifier(name) && isCallTo({ name: factoryName, node: initializer })
    )
    ?.name.getText() ?? null;

const findUsecaseBuilderCode = ({
  declarations,
  factoryName,
}: {
  readonly declarations: readonly ts.VariableDeclaration[];
  readonly factoryName: string;
}): null | string => {
  const builderName = declarations
    .find(
      ({ initializer, name }) =>
        ts.isIdentifier(name) &&
        isDefined(initializer) &&
        ts.isArrowFunction(initializer) &&
        initializer.parameters.length === 0 &&
        isCallTo({ name: factoryName, node: initializer.body })
    )
    ?.name.getText();
  return isDefined(builderName) ? `${builderName}()` : null;
};

// 手で書いたファクトリーが gateways を受け取るとき、渡す gateways は controller にしか書かれていないため、
// controller の中での作り方を写す
const findUsecaseExpression = ({
  controllerContent,
  factory,
  factoryName,
}: {
  readonly controllerContent: null | string;
  readonly factory: UsecaseFactory;
  readonly factoryName: string;
}): Result<string> => {
  const sourceFile = parseTypeScript({ content: controllerContent ?? '', path: 'controller.ts' });
  const declarations = listTopLevelVariableDeclarations({ isExportedOnly: false, sourceFile });
  const calls = listCallExpressions({ name: factoryName, sourceFile });
  const usecaseCode =
    findUsecaseVariableCode({ declarations, factoryName }) ??
    findUsecaseBuilderCode({ declarations, factoryName }) ??
    calls.find((call) => isPortableCall(call))?.getText(sourceFile);
  if (isDefined(usecaseCode)) {
    return { ok: true, value: usecaseCode };
  }

  if (factory.dependencies === null) {
    return { ok: true, value: `${factoryName}()` };
  }

  return {
    error: new Error(
      calls.length === 0
        ? `${factoryName} は gateways を受け取りますが、controller に ${factoryName} の呼び出しがないため、渡す gateways を決められません。controller で ${factoryName} を 1 度呼んでから実行してください`
        : `controller の ${factoryName} の呼び出しが、handler の引数や局所の名前（context など）か await を使っているため、新しい handler に写せません。controller で ${factoryName} をモジュールの const か、引数のない const build… = (): … => ${factoryName}(…) で作ってから実行してください`
    ),
    ok: false,
  };
};

const buildMockObjectCode = (names: readonly string[]): string =>
  `{ ${names.map((name) => `${name}: vi.fn()`).join(', ')} }`;

// 型にないキーを渡すと余分なプロパティとして型検査で失敗するため、名前を持つ依存だけを渡す
const buildUsecaseConstructionCode = ({
  factory,
  factoryName,
}: {
  readonly factory: UsecaseFactory;
  readonly factoryName: string;
}): string =>
  factory.dependencies === null
    ? `${factoryName}()`
    : `${factoryName}(${buildObjectCode(
        Object.entries(factory.dependencies)
          .filter(([, names]) => names.length > 0)
          .map(([key, names]) => `${key}: ${buildMockObjectCode(names)}`)
      )})`;

const planUsecase = ({
  controllerContent,
  factoryName,
  operationName,
  path,
  usecaseContent,
}: {
  readonly controllerContent: null | string;
  readonly factoryName: string;
  readonly operationName: string;
  readonly path: string;
  readonly usecaseContent: string;
}): Result<{
  readonly factory: UsecaseFactory;
  readonly usecaseExpressionCode: string;
}> => {
  const factoryResult = findUsecaseFactory({ content: usecaseContent, factoryName, path });
  if (!factoryResult.ok) {
    return factoryResult;
  }

  if (factoryResult.value.operationNames.includes(operationName)) {
    return {
      error: new Error(`${path} の ${factoryName} は既に操作 ${operationName} を持っています`),
      ok: false,
    };
  }

  const expressionResult = findUsecaseExpression({
    controllerContent,
    factory: factoryResult.value,
    factoryName,
  });
  if (!expressionResult.ok) {
    return expressionResult;
  }

  return {
    ok: true,
    value: { factory: factoryResult.value, usecaseExpressionCode: expressionResult.value },
  };
};

// Route Handler は controller の handler を HTTP メソッドの名前で export { … } from で書き出すだけのため（controllers.md）、
// それ以外の文があれば追記の前提が崩れる。import と export const <METHOD> = <handler>; の形は unicorn/prefer-export-from が拒む
const routeStatementPattern = /export\s*\{[^}]*\}\s*from\s*['"]@\/controllers\/\w+['"];/g;

const findRouteShapeConflicts = (content: string): readonly string[] =>
  content.replaceAll(routeStatementPattern, '').trim() === ''
    ? []
    : [
        'route.ts が controller の handler を書き出す export { … } from 以外の文を持つため、追記できません',
      ];

const findDefinitionConflicts = ({
  content,
  name,
}: {
  readonly content: string;
  readonly name: string;
}): readonly string[] =>
  content.includes(`export const ${name} `) ? [`${name} は既に定義されています`] : [];

const findRouteConflicts = ({
  content,
  method,
}: {
  readonly content: string;
  readonly method: HttpMethod;
}): readonly string[] => [
  ...(new RegExp(String.raw`\bas ${method}\b`).test(content)
    ? [`route.ts は既に ${method} を export しています`]
    : []),
  ...findRouteShapeConflicts(content),
];

const readExistingFile = ({
  destinationRoot,
  path,
}: {
  readonly destinationRoot: string;
  readonly path: string;
}): null | string => {
  const absolutePath = nodePath.resolve(destinationRoot, path);
  return existsSync(absolutePath) ? readFileSync(absolutePath, 'utf8') : null;
};

const findFileConflicts = ({
  destinationRoot,
  files,
  method,
  names,
}: {
  readonly destinationRoot: string;
  readonly files: ApiFilePaths;
  readonly method: HttpMethod;
  readonly names: ApiNames;
}): readonly string[] =>
  [
    {
      findConflictsIn: (content: string): readonly string[] =>
        findDefinitionConflicts({ content, name: names.endpointName }),
      path: files.endpoints,
    },
    {
      findConflictsIn: (content: string): readonly string[] =>
        findDefinitionConflicts({ content, name: names.handlerName }),
      path: files.controller,
    },
    {
      findConflictsIn: (content: string): readonly string[] =>
        findRouteConflicts({ content, method }),
      path: files.route,
    },
  ].flatMap(({ findConflictsIn, path }) => {
    const content = readExistingFile({ destinationRoot, path });
    return content === null
      ? []
      : findConflictsIn(content).map((conflict) => `${path}: ${conflict}`);
  });

const createRejecting =
  (message: string): (() => Promise<string>) =>
  (): Promise<string> =>
    Promise.reject(new Error(message));

const escapeRegularExpression = (text: string): string =>
  text.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);

const hasImport = ({
  content,
  namedImport,
}: {
  readonly content: string;
  readonly namedImport: NamedImport;
}): boolean =>
  new RegExp(
    String.raw`import[^;]*\b${namedImport.name}\b[^;]*from ['"]${escapeRegularExpression(namedImport.module)}['"];`
  ).test(content);

const splitImportedNames = (importedNamesCode: string): readonly string[] =>
  importedNamesCode
    .split(',')
    .map((name) => name.trim())
    .filter((name) => name !== '');

const buildImportStatement = ({
  isType,
  module,
  names,
}: {
  readonly isType: boolean;
  readonly module: string;
  readonly names: readonly string[];
}): string => `import ${isType ? 'type ' : ''}{ ${names.join(', ')} } from '${module}';`;

const createImportStatementPattern = ({ isType, module }: NamedImport): RegExp =>
  new RegExp(
    String.raw`import ${isType ? 'type ' : ''}\{([^}]*)\} from ['"]${escapeRegularExpression(module)}['"];`
  );

// 既に同じ名前を import していれば何もしない。同じモジュールからの同じ種類（型か値か）の import 文があればそこに名前を足し、
// なければ先頭に 1 行足す。並び順は最後の createFormatting が perfectionist でそろえる
const addNamedImport = ({
  content,
  namedImport,
}: {
  readonly content: string;
  readonly namedImport: NamedImport;
}): string => {
  if (hasImport({ content, namedImport })) {
    return content;
  }

  const pattern = createImportStatementPattern(namedImport);
  const importedNamesCode = pattern.exec(content)?.[1];
  // import 文の後に空行を置く書き方にそろえるため、import 文でない行の前に足すときは空行を挟む
  if (!isDefined(importedNamesCode)) {
    return `${buildImportStatement({ ...namedImport, names: [namedImport.name] })}\n${content.startsWith('import ') ? '' : '\n'}${content}`;
  }

  return content.replace(pattern, () =>
    buildImportStatement({
      ...namedImport,
      names: [...splitImportedNames(importedNamesCode), namedImport.name],
    })
  );
};

const addNamedImports = ({
  content,
  namedImports,
}: {
  readonly content: string;
  readonly namedImports: readonly NamedImport[];
}): string => {
  const [namedImport, ...otherNamedImports] = namedImports;
  return isDefined(namedImport)
    ? addNamedImports({
        content: addNamedImport({ content, namedImport }),
        namedImports: otherNamedImports,
      })
    : content;
};

const createAddingNamedImports =
  ({
    absolutePath,
    namedImports,
    path,
  }: {
    readonly absolutePath: string;
    readonly namedImports: readonly NamedImport[];
    readonly path: string;
  }): (() => Promise<string>) =>
  async (): Promise<string> => {
    await writeFile(
      absolutePath,
      addNamedImports({ content: await readFile(absolutePath, 'utf8'), namedImports })
    );
    return path;
  };

// 追記する雛形は import を持たないため、ないファイルは空で作ってから import と本文を足す。
// flag の a は、既にあるファイルの中身を変えずに開くため
const createEnsuringFile =
  ({
    absolutePath,
    path,
  }: {
    readonly absolutePath: string;
    readonly path: string;
  }): (() => Promise<string>) =>
  async (): Promise<string> => {
    await mkdir(nodePath.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, '', { flag: 'a' });
    return path;
  };

const createWritingFile =
  ({
    absolutePath,
    content,
    path,
  }: {
    readonly absolutePath: string;
    readonly content: string;
    readonly path: string;
  }): (() => Promise<string>) =>
  async (): Promise<string> => {
    await mkdir(nodePath.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, content);
    return path;
  };

const createRouteExportPattern = (module: string): RegExp =>
  new RegExp(String.raw`export\s*\{([^}]*)\}\s*from\s*['"]${escapeRegularExpression(module)}['"];`);

// Route Handler は controller の handler を export { … } from で書き出す（src/app/api/todos/route.ts と同じ形）。
// 同じ controller から書き出す文があればそこに足し、なければ末尾に 1 文足す
const addRouteExport = ({
  content,
  handlerName,
  method,
  module,
}: {
  readonly content: string;
  readonly handlerName: string;
  readonly method: HttpMethod;
  readonly module: string;
}): string => {
  const pattern = createRouteExportPattern(module);
  const exportedNamesCode = pattern.exec(content)?.[1];
  const specifier = `${handlerName} as ${method}`;
  if (!isDefined(exportedNamesCode)) {
    return `${content.trimEnd()}${content.trim() === '' ? '' : '\n\n'}export { ${specifier} } from '${module}';\n`;
  }

  return content.replace(
    pattern,
    () =>
      `export { ${[...splitImportedNames(exportedNamesCode), specifier].join(', ')} } from '${module}';`
  );
};

const createAddingRouteExport =
  ({
    absolutePath,
    handlerName,
    method,
    module,
    path,
  }: {
    readonly absolutePath: string;
    readonly handlerName: string;
    readonly method: HttpMethod;
    readonly module: string;
    readonly path: string;
  }): (() => Promise<string>) =>
  async (): Promise<string> => {
    await writeFile(
      absolutePath,
      addRouteExport({
        content: await readFile(absolutePath, 'utf8'),
        handlerName,
        method,
        module,
      })
    );
    return path;
  };

const formatFile = async ({
  absolutePath,
  eslint,
}: {
  readonly absolutePath: string;
  readonly eslint: ESLint;
}): Promise<{ readonly absolutePath: string; readonly content: string }> => {
  const content = await readFile(absolutePath, 'utf8');
  const [lintResult] = await eslint.lintText(content, { filePath: absolutePath });
  // ESLint は直すところがなかったファイルには output を返さない
  const fixedContent = lintResult?.output ?? content;
  return {
    absolutePath,
    content: await format(fixedContent, {
      ...(await resolveConfig(absolutePath)),
      filepath: absolutePath,
    }),
  };
};

// テンプレートの import や object のキーの並びを ESLint の perfectionist と同じ規則で並べ替えてから Prettier で整える。
// 既存のファイルへ追記した結果も同じ形にそろうため、生成した直後に ESLint と Prettier の検査を通る。
// plop は失敗した時点でプロセスを終えるため、書き込みの途中で切れたファイルを残さないよう、すべて整えてから書き込む
const createFormatting =
  ({
    destinationRoot,
    paths,
  }: {
    readonly destinationRoot: string;
    readonly paths: readonly string[];
  }): (() => Promise<string>) =>
  async (): Promise<string> => {
    const eslint = new ESLint({
      cwd: destinationRoot,
      fix: true,
      overrideConfig: [
        { ...perfectionist.configs['recommended-natural'], files: ['**/*.{ts,tsx}'] },
        { files: ['**/*.ts'], languageOptions: { parser: tseslint.parser } },
        {
          files: ['**/*.tsx'],
          languageOptions: {
            parser: tseslint.parser,
            parserOptions: { ecmaFeatures: { jsx: true } },
          },
        },
      ],
      overrideConfigFile: true,
    });
    const formattedFiles = await Promise.all(
      paths.map((path) =>
        formatFile({ absolutePath: nodePath.resolve(destinationRoot, path), eslint })
      )
    );
    for (const { absolutePath, content } of formattedFiles) {
      await writeFile(absolutePath, content);
    }

    return paths.join(', ');
  };

const apiTemplateDirectory = 'plop-templates/api';

const buildNewFileAction = ({
  path,
  templateData,
  templateDirectory,
  templateName,
}: {
  readonly path: string;
  readonly templateData: object;
  readonly templateDirectory: string;
  readonly templateName: string;
}): ActionType => ({
  data: templateData,
  path,
  templateFile: `${templateDirectory}/${templateName}.hbs`,
  type: 'add',
});

const buildAppendAction = ({
  path,
  templateData,
  templateDirectory,
  templateName,
}: {
  readonly path: string;
  readonly templateData: object;
  readonly templateDirectory: string;
  readonly templateName: string;
}): ActionType => ({
  data: templateData,
  path,
  // pattern を空にすると末尾に追記される。unique を切るのは、node-plop が追記する文字列を正規表現として解釈し、括弧を含むコードで失敗するため
  pattern: '',
  separator: '\n',
  templateFile: `${templateDirectory}/${templateName}.hbs`,
  type: 'append',
  unique: false,
});

const buildNamedImports = ({
  isType,
  module,
  names,
}: {
  readonly isType: boolean;
  readonly module: string;
  readonly names: readonly string[];
}): readonly NamedImport[] => names.map((name) => ({ isType, module, name }));

const resultTypeImports: readonly NamedImport[] = [
  { isType: true, module: '@/entities/apiFailure', name: 'ApiFailure' },
  { isType: true, module: '@/entities/result', name: 'Result' },
];

const buildControllerImports = ({
  endpointsModule,
  templateData,
  usecaseModule,
}: {
  readonly endpointsModule: string;
  readonly templateData: ApiTemplateData;
  readonly usecaseModule: string;
}): readonly NamedImport[] => [
  { isType: false, module: endpointsModule, name: templateData.endpointName },
  // 既に createRequestUsecase を持つ controller は、それが使う gateway・presenter・usecase の import も持っているため足さない
  ...(templateData.hasRequestUsecaseBuilder && !templateData.shouldAddRequestUsecaseBuilder
    ? []
    : [
        { isType: false, module: '@/gateways/errorLogGateway', name: 'printErrorLog' },
        {
          isType: false,
          module: '@/gateways/requestInputGateway',
          name: 'createReadingRequestInput',
        },
        ...buildNamedImports({
          isType: false,
          module: '@/presenters/apiResponsePresenter',
          names: ['presentFailure', 'presentSuccess'],
        }),
        {
          isType: false,
          module: '@/usecases/api-request/usecase',
          name: 'createApiRequestUsecase',
        },
      ]),
  // モジュールの const や build 関数で usecase を作る controller は、ファクトリーを handler から直に呼ばないため import しない
  ...(templateData.usecaseExpressionCode.includes(templateData.usecaseFactoryName)
    ? [{ isType: false, module: usecaseModule, name: templateData.usecaseFactoryName }]
    : []),
];

// usecase.ts と route.ts 以外は、ないときに空で作り、足りない import を足してから本文を末尾に追記する
const buildApiFileAppendings = ({
  files,
  templateData,
}: {
  readonly files: ApiFilePaths;
  readonly templateData: ApiTemplateData;
}): readonly {
  readonly namedImports: readonly NamedImport[];
  readonly path: string;
  readonly templateNames: readonly string[];
}[] => {
  const usecaseModule = `@/usecases/${templateData.usecaseDirectory}/usecase`;
  return [
    {
      namedImports: [
        ...buildNamedImports({
          isType: false,
          module: 'vitest',
          names: [
            'expect',
            'it',
            ...(templateData.usecaseConstructionCode.includes('vi.fn()') ? ['vi'] : []),
          ],
        }),
        { isType: false, module: usecaseModule, name: templateData.usecaseFactoryName },
      ],
      path: files.usecaseTest,
      templateNames: ['usecaseTest'],
    },
    {
      namedImports: [
        { isType: false, module: 'zod', name: 'z' },
        { isType: false, module: '@/api/endpoint', name: 'defineEndpoint' },
      ],
      path: files.endpoints,
      templateNames: ['endpoint'],
    },
    {
      namedImports: buildControllerImports({
        endpointsModule: `@/api/${templateData.concept}/endpoints`,
        templateData,
        usecaseModule,
      }),
      path: files.controller,
      templateNames: [
        ...(templateData.shouldAddRequestUsecaseBuilder ? ['controllerRequestUsecase'] : []),
        'controller',
      ],
    },
    {
      namedImports: [
        ...buildNamedImports({ isType: false, module: 'vitest', names: ['expect', 'it', 'vi'] }),
        {
          isType: false,
          module: `@/controllers/${templateData.controllerFileName}`,
          name: templateData.handlerName,
        },
      ],
      path: files.controllerTest,
      templateNames: ['controllerTest'],
    },
  ];
};

const buildApiActions = ({
  destinationRoot,
  files,
  templateData,
  usecaseContent,
}: {
  readonly destinationRoot: string;
  readonly files: ApiFilePaths;
  readonly templateData: ApiTemplateData;
  readonly usecaseContent: string;
}): ActionType[] => {
  const appendings = buildApiFileAppendings({ files, templateData });
  return [
    createWritingFile({
      absolutePath: nodePath.resolve(destinationRoot, files.usecase),
      content: usecaseContent,
      path: files.usecase,
    }),
    ...appendings.flatMap(({ namedImports, path, templateNames }) => [
      createEnsuringFile({ absolutePath: nodePath.resolve(destinationRoot, path), path }),
      createAddingNamedImports({
        absolutePath: nodePath.resolve(destinationRoot, path),
        namedImports,
        path,
      }),
      ...templateNames.map((templateName) =>
        buildAppendAction({
          path,
          templateData,
          templateDirectory: apiTemplateDirectory,
          templateName,
        })
      ),
    ]),
    createEnsuringFile({
      absolutePath: nodePath.resolve(destinationRoot, files.route),
      path: files.route,
    }),
    createAddingRouteExport({
      absolutePath: nodePath.resolve(destinationRoot, files.route),
      handlerName: templateData.handlerName,
      method: templateData.method,
      module: `@/controllers/${templateData.controllerFileName}`,
      path: files.route,
    }),
    createFormatting({
      destinationRoot,
      paths: [files.usecase, ...appendings.map(({ path }) => path), files.route],
    }),
  ];
};

const routeParameterDirectoryPattern = /^\[([a-zA-Z0-9]+)\]$/;

// Next.js は同じ場所に名前の違う動的な区切りのディレクトリがあると経路を組み立てられないため
const findDynamicSegmentConflicts = ({
  destinationRoot,
  directory,
  segment,
}: {
  readonly destinationRoot: string;
  readonly directory: string;
  readonly segment: string;
}): readonly string[] => {
  const parameterName = /^\{([a-zA-Z0-9]+)\}$/.exec(segment)?.[1];
  const absoluteDirectory = nodePath.resolve(destinationRoot, directory);
  if (!isDefined(parameterName) || !existsSync(absoluteDirectory)) {
    return [];
  }

  return readdirSync(absoluteDirectory, { withFileTypes: true }).flatMap((entry) => {
    const existingName = routeParameterDirectoryPattern.exec(entry.name)?.[1];
    return existingName !== parameterName && isDefined(existingName) && entry.isDirectory()
      ? [
          `${directory}/${entry.name} があるため、同じ場所の動的な区切りは {${existingName}} にしてください`,
        ]
      : [];
  });
};

const findRouteDirectoryConflicts = ({
  destinationRoot,
  path,
}: {
  readonly destinationRoot: string;
  readonly path: string;
}): readonly string[] => {
  const segments = path.split('/').slice(1);
  return Array.from(segments.entries(), ([index, segment]) =>
    findDynamicSegmentConflicts({
      destinationRoot,
      directory: `src/app/${toRouteDirectory(segments.slice(0, index).join('/'))}`,
      segment,
    })
  ).flat();
};

const findApiConflicts = ({
  answers,
  destinationRoot,
  files,
  names,
  usecaseFailure,
}: {
  readonly answers: ApiAnswers;
  readonly destinationRoot: string;
  readonly files: ApiFilePaths;
  readonly names: ApiNames;
  readonly usecaseFailure: readonly string[];
}): readonly string[] => [
  ...findActionConflicts({
    action: answers.action,
    conceptPascalCase: names.conceptPascalCase,
  }),
  ...usecaseFailure,
  ...findFileConflicts({ destinationRoot, files, method: answers.method, names }),
  ...findRouteDirectoryConflicts({ destinationRoot, path: answers.path }),
];

const createBuildingApiActions =
  (destinationRoot: string): ((answers: unknown) => ActionType[]) =>
  (answers: unknown): ActionType[] => {
    const parsed = apiAnswersSchema.safeParse(answers);
    if (!parsed.success) {
      return [createRejecting(z.prettifyError(parsed.error))];
    }

    const names = buildApiNames(parsed.data);
    const files = buildFilePaths({ answers: parsed.data, names });
    const usecaseContent =
      readExistingFile({ destinationRoot, path: files.usecase }) ??
      usecaseSkeletonCode({ factoryName: names.usecaseFactoryName });
    const controllerContent = readExistingFile({ destinationRoot, path: files.controller });
    const usecasePlan = planUsecase({
      controllerContent,
      factoryName: names.usecaseFactoryName,
      operationName: parsed.data.action,
      path: files.usecase,
      usecaseContent,
    });
    const conflicts = findApiConflicts({
      answers: parsed.data,
      destinationRoot,
      files,
      names,
      usecaseFailure: usecasePlan.ok ? [] : [usecasePlan.error.message],
    });
    if (!usecasePlan.ok || conflicts.length > 0) {
      return [
        createRejecting(
          `次の理由で api を生成できないため、何も書き込みませんでした。\n${conflicts.join('\n')}`
        ),
      ];
    }

    return buildApiActions({
      destinationRoot,
      files,
      templateData: buildTemplateData({
        answers: parsed.data,
        controllerContent,
        endpointsContent: readExistingFile({ destinationRoot, path: files.endpoints }),
        names,
        usecaseConstructionCode: buildUsecaseConstructionCode({
          factory: usecasePlan.value.factory,
          factoryName: names.usecaseFactoryName,
        }),
        usecaseExpressionCode: usecasePlan.value.usecaseExpressionCode,
      }),
      usecaseContent: addNamedImports({
        content: insertUsecaseOperation({
          content: usecaseContent,
          factory: usecasePlan.value.factory,
          operationCode: notImplementedOperationCode,
          operationName: parsed.data.action,
          operationTypeCode: notImplementedOperationTypeCode,
        }),
        namedImports: resultTypeImports,
      }),
    });
  };

const screenKindSchema = z.enum(['blank', 'collection', 'detail', 'form'], {
  error: 'kind は blank・collection・detail・form のどれかで指定してください',
});

// /api の下は Route Handler の場所で、画面の page.tsx を置くと API の経路と重なるため
const screenPathSchema = z
  .string()
  .regex(
    /^(\/([a-z0-9]+(-[a-z0-9]+)*|\[[a-z][a-zA-Z0-9]*\]))+$/,
    'path は / で始まり、kebab-case の区切りと [camelCase] の動的な区切りだけからなるパス（例: /inventory-items、/inventory-items/[id]）で指定してください'
  )
  .refine(
    (path) => !/^\/api(\/|$)/.test(path),
    'path は /api で始められません。/api の下は API の Route Handler の場所です'
  )
  .refine(
    (path) => hasUniqueParameterNames({ path, pattern: dynamicSegmentPattern }),
    duplicateParameterNamesMessage
  );

const screenAnswersSchema = z.object({
  concept: conceptSchema,
  kind: screenKindSchema,
  path: screenPathSchema,
});

// layout.tsx の metadata の title が template を持つときは、各画面の title に見出しだけを書けば template がアプリの名前を付ける
type MetadataTitleFormat =
  | { readonly applicationName: string; readonly hasTemplate: false }
  | { readonly hasTemplate: true };

type ScreenFile = {
  readonly path: string;
  readonly templateName: string;
};

type ScreenFilePaths = {
  readonly apiFile: string;
  readonly newFiles: readonly ScreenFile[];
  readonly page: string;
};

type ScreenKind = z.infer<typeof screenKindSchema>;

type ScreenTemplateData = {
  readonly componentImportPath: string;
  readonly componentName: string;
  readonly concept: string;
  readonly dataTypeName: string;
  readonly featureDirectory: string;
  readonly hasEmptyStory: boolean;
  readonly hasNotFoundStory: boolean;
  readonly hasParameters: boolean;
  readonly hasRowsSelectedStory: boolean;
  readonly heading: string;
  readonly idealValueCode: string;
  readonly kind: ScreenKind;
  readonly metadataDescriptionCode: string;
  readonly metadataTitleCode: string;
  readonly mutationOptionsName: string;
  readonly parametersTypeCode: string;
  readonly queryOptionsName: string;
  readonly sampleOptionsCode: string;
  readonly sampleParametersCode: string;
  readonly screenOptionsCode: string;
  readonly validateFunctionName: string;
  readonly validationFileName: string;
  readonly validationImportPath: string;
  readonly valueTypeCode: string;
};

const layoutPath = 'src/app/layout.tsx';

// Prettier で整えた layout.tsx では metadata の直下のキーが 2 つの空白で始まるため、その字下げで openGraph.title などの入れ子の title と見分ける
const topLevelTitlePattern = /^ {2}title: (\{[^\n]*\}|\{\n[\s\S]*?^ {2}\}|'[^'\n]*'|"[^"\n]*")/m;

const createTitleFailure = (reason: string): { readonly error: Error; readonly ok: false } => ({
  error: new Error(
    `${layoutPath} の${reason}ため、画面の title を決められません。何も書き込みませんでした。layout.tsx の metadata の直下に title を文字列か template を持つオブジェクトで書いてください`
  ),
  ok: false,
});

const readMetadataTitleFormat = (destinationRoot: string): Result<MetadataTitleFormat> => {
  const metadataCode = readExistingFile({ destinationRoot, path: layoutPath })?.match(
    /export const metadata: Metadata = \{[\s\S]*?\n\};/
  )?.[0];
  if (!isDefined(metadataCode)) {
    return createTitleFailure(' metadata が見つからない');
  }

  const titleCode = topLevelTitlePattern.exec(metadataCode)?.[1];
  if (!isDefined(titleCode)) {
    return createTitleFailure(' metadata の直下に title がない');
  }

  if (!titleCode.startsWith('{')) {
    return { ok: true, value: { applicationName: titleCode.slice(1, -1), hasTemplate: false } };
  }

  return /\btemplate:/.test(titleCode)
    ? { ok: true, value: { hasTemplate: true } }
    : createTitleFailure(' metadata の title のオブジェクトに template がない');
};

const headingSuffixByKind: Readonly<Record<ScreenKind, string>> = {
  blank: '',
  collection: ' の一覧',
  detail: ' の詳細',
  form: ' の入力',
};

const dataTypeSuffixByKind: Readonly<Record<ScreenKind, string>> = {
  blank: 'BlankItem',
  collection: 'CollectionRow',
  detail: 'Detail',
  form: 'FormValues',
};

const sampleItemCode = "{ id: '1', name: '見本' }";

const buildParameterFields = (
  parameterNames: readonly string[]
): { readonly sampleParametersCode: string; readonly typeCode: string } => ({
  sampleParametersCode: buildObjectCode(parameterNames.map((name) => `${name}: '1'`)),
  typeCode: buildObjectCode(parameterNames.map((name) => `readonly ${name}: string`)),
});

const withParameters = ({
  argumentCode,
  hasParameters,
  name,
}: {
  readonly argumentCode: string;
  readonly hasParameters: boolean;
  readonly name: string;
}): string => (hasParameters ? `${name}(${argumentCode})` : name);

const buildScreenTemplateData = ({
  answers,
  titleFormat,
}: {
  readonly answers: z.infer<typeof screenAnswersSchema>;
  readonly titleFormat: MetadataTitleFormat;
}): ScreenTemplateData => {
  const conceptPascalCase = toPascalCaseFromKebabCase(answers.concept);
  const conceptCamelCase = decapitalize(conceptPascalCase);
  const kindPascalCase = capitalize(answers.kind);
  const parameterNames = listParameterNames({ path: answers.path, pattern: dynamicSegmentPattern });
  const hasParameters = parameterNames.length > 0;
  const parameterFields = buildParameterFields(parameterNames);
  const componentName = `${conceptPascalCase}${kindPascalCase}Screen`;
  const featureDirectory = `src/features/${answers.concept}/${answers.concept}-${answers.kind}-screen`;
  const dataTypeName = `${conceptPascalCase}${dataTypeSuffixByKind[answers.kind]}`;
  const heading = `${answers.concept}${headingSuffixByKind[answers.kind]}`;
  const hasItems = answers.kind === 'blank' || answers.kind === 'collection';
  const queryOptionsName = `${conceptCamelCase}${kindPascalCase}QueryOptions`;
  const mutationOptionsName = `${conceptCamelCase}FormMutationOptions`;
  const validationFileName = `${conceptCamelCase}FormValidation`;
  return {
    componentImportPath: `@/${featureDirectory.replace(/^src\//, '')}/${componentName}`,
    componentName,
    concept: answers.concept,
    dataTypeName,
    featureDirectory,
    hasEmptyStory: hasItems,
    hasNotFoundStory: answers.kind === 'detail',
    hasParameters,
    hasRowsSelectedStory: answers.kind === 'collection',
    heading,
    idealValueCode: hasItems ? `[${sampleItemCode}]` : sampleItemCode,
    kind: answers.kind,
    metadataDescriptionCode: JSON.stringify(heading),
    metadataTitleCode: JSON.stringify(
      titleFormat.hasTemplate ? heading : `${heading} | ${titleFormat.applicationName}`
    ),
    mutationOptionsName,
    parametersTypeCode: parameterFields.typeCode,
    queryOptionsName,
    sampleOptionsCode: withParameters({
      argumentCode: parameterFields.sampleParametersCode,
      hasParameters,
      name: queryOptionsName,
    }),
    sampleParametersCode: parameterFields.sampleParametersCode,
    screenOptionsCode: withParameters({
      argumentCode: 'parameters',
      hasParameters,
      name: answers.kind === 'form' ? mutationOptionsName : queryOptionsName,
    }),
    validateFunctionName: `validate${conceptPascalCase}Form`,
    validationFileName,
    validationImportPath: `@/${featureDirectory.replace(/^src\//, '')}/${validationFileName}`,
    valueTypeCode: hasItems ? `readonly ${dataTypeName}[]` : dataTypeName,
  };
};

const appDirectory = 'src/app';

const buildScreenFilePaths = ({
  path,
  templateData,
}: {
  readonly path: string;
  readonly templateData: ScreenTemplateData;
}): ScreenFilePaths => {
  const componentBase = `${templateData.featureDirectory}/${templateData.componentName}`;
  const isForm = templateData.kind === 'form';
  const validationBase = `${templateData.featureDirectory}/${templateData.validationFileName}`;
  const page = `${appDirectory}${path}/page.tsx`;
  return {
    apiFile: `src/api/${templateData.concept}/${isForm ? 'mutations' : 'queries'}.ts`,
    newFiles: [
      { path: page, templateName: 'page' },
      { path: `${componentBase}.tsx`, templateName: `${templateData.kind}Screen` },
      {
        path: `${componentBase}.stories.tsx`,
        templateName: isForm ? 'formStories' : 'queryStories',
      },
      {
        path: `${templateData.featureDirectory}/${decapitalize(templateData.componentName)}.test.tsx`,
        templateName: isForm ? 'formScreenTest' : 'queryScreenTest',
      },
      ...(isForm
        ? [
            { path: `${validationBase}.ts`, templateName: 'formValidation' },
            { path: `${validationBase}.test.ts`, templateName: 'formValidationTest' },
          ]
        : []),
    ],
    page,
  };
};

const buildApiFileImports = (kind: ScreenKind): readonly NamedImport[] => [
  {
    isType: false,
    module: '@tanstack/react-query',
    name: kind === 'form' ? 'mutationOptions' : 'queryOptions',
  },
  ...resultTypeImports,
];

const listApiFileExportNames = (templateData: ScreenTemplateData): readonly string[] =>
  templateData.kind === 'form'
    ? [templateData.mutationOptionsName, templateData.dataTypeName]
    : [templateData.queryOptionsName, templateData.dataTypeName];

const routeGroupNamePattern = /^\(.+\)$/;

const listRouteGroupDirectories = (destinationRoot: string): readonly string[] =>
  readdirSync(nodePath.resolve(destinationRoot, appDirectory), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && routeGroupNamePattern.test(entry.name))
    .map((entry) => `${appDirectory}/${entry.name}`);

// ルートグループの名前は URL に入らないため、src/app の直下や別のルートグループにある同じ URL の page.tsx・route.ts と
// 重なると、Next.js が経路を組み立てられない
const listSameUrlFiles = ({
  destinationRoot,
  page,
  path,
}: {
  readonly destinationRoot: string;
  readonly page: string;
  readonly path: string;
}): readonly string[] =>
  [appDirectory, ...listRouteGroupDirectories(destinationRoot)]
    .flatMap((directory) => [`${directory}${path}/page.tsx`, `${directory}${path}/route.ts`])
    .filter(
      (sameUrlFile) =>
        sameUrlFile !== page && existsSync(nodePath.resolve(destinationRoot, sameUrlFile))
    );

const findApiFileConflicts = ({
  apiFile,
  destinationRoot,
  templateData,
}: {
  readonly apiFile: string;
  readonly destinationRoot: string;
  readonly templateData: ScreenTemplateData;
}): readonly string[] => {
  const apiFileContent = readExistingFile({ destinationRoot, path: apiFile });
  return apiFileContent === null
    ? []
    : listApiFileExportNames(templateData)
        .filter((name) =>
          new RegExp(String.raw`export (const|type) ${name}\b`).test(apiFileContent)
        )
        .map((name) => `${apiFile}: ${name} は既に定義されています`);
};

const findScreenConflicts = ({
  destinationRoot,
  files,
  path,
  templateData,
}: {
  readonly destinationRoot: string;
  readonly files: ScreenFilePaths;
  readonly path: string;
  readonly templateData: ScreenTemplateData;
}): readonly string[] => [
  ...files.newFiles
    .filter(({ path: newFilePath }) => existsSync(nodePath.resolve(destinationRoot, newFilePath)))
    .map(({ path: newFilePath }) => `${newFilePath} は既にあります`),
  ...listSameUrlFiles({ destinationRoot, page: files.page, path }).map(
    (sameUrlFile) => `${sameUrlFile} があるため、同じ URL に画面を置けません`
  ),
  ...findApiFileConflicts({ apiFile: files.apiFile, destinationRoot, templateData }),
];

const screenTemplateDirectory = 'plop-templates/screen';

const buildScreenActions = ({
  destinationRoot,
  files,
  templateData,
}: {
  readonly destinationRoot: string;
  readonly files: ScreenFilePaths;
  readonly templateData: ScreenTemplateData;
}): ActionType[] => [
  ...files.newFiles.map(({ path, templateName }) =>
    buildNewFileAction({
      path,
      templateData,
      templateDirectory: screenTemplateDirectory,
      templateName,
    })
  ),
  createEnsuringFile({
    absolutePath: nodePath.resolve(destinationRoot, files.apiFile),
    path: files.apiFile,
  }),
  createAddingNamedImports({
    absolutePath: nodePath.resolve(destinationRoot, files.apiFile),
    namedImports: buildApiFileImports(templateData.kind),
    path: files.apiFile,
  }),
  buildAppendAction({
    path: files.apiFile,
    templateData,
    templateDirectory: screenTemplateDirectory,
    templateName: templateData.kind === 'form' ? 'mutation' : 'query',
  }),
  createFormatting({
    destinationRoot,
    paths: [...files.newFiles.map(({ path }) => path), files.apiFile],
  }),
];

const createBuildingScreenActions =
  (destinationRoot: string): ((answers: unknown) => ActionType[]) =>
  (answers: unknown): ActionType[] => {
    const parsed = screenAnswersSchema.safeParse(answers);
    if (!parsed.success) {
      return [createRejecting(z.prettifyError(parsed.error))];
    }

    const titleFormatResult = readMetadataTitleFormat(destinationRoot);
    if (!titleFormatResult.ok) {
      return [createRejecting(titleFormatResult.error.message)];
    }

    const templateData = buildScreenTemplateData({
      answers: parsed.data,
      titleFormat: titleFormatResult.value,
    });
    const files = buildScreenFilePaths({ path: parsed.data.path, templateData });
    const conflicts = findScreenConflicts({
      destinationRoot,
      files,
      path: parsed.data.path,
      templateData,
    });
    if (conflicts.length > 0) {
      return [
        createRejecting(
          `既存のファイルと重なるため、何も書き込みませんでした。\n${conflicts.join('\n')}`
        ),
      ];
    }

    return buildScreenActions({ destinationRoot, files, templateData });
  };

type GeneratorDefinition = {
  readonly actions: (answers: unknown) => ActionType[];
  readonly arguments: readonly {
    readonly message: string;
    readonly name: string;
    readonly schema: z.ZodType;
  }[];
  readonly description: string;
  readonly name: string;
};

// 新しい generator はここに足す。arguments は prompts になり、端末がないときに揃っているかを確かめる対象にもなる
const buildGeneratorDefinitions = (destinationRoot: string): readonly GeneratorDefinition[] => [
  {
    actions: createBuildingApiActions(destinationRoot),
    arguments: [
      {
        message: 'concept（kebab-case、例: inventory-item）',
        name: 'concept',
        schema: conceptSchema,
      },
      {
        message: 'action（camelCase、例: list、getLatestSet）',
        name: 'action',
        schema: actionSchema,
      },
      { message: 'method（GET・POST・PUT・PATCH・DELETE）', name: 'method', schema: methodSchema },
      {
        message:
          'path（/api/ で始まり、動的な区切りを {camelCase} で書くパス、例: /api/inventory-items/{id}）',
        name: 'path',
        schema: endpointPathSchema,
      },
    ],
    description: 'API のエンドポイント 1 本分の骨組みを作る',
    name: 'api',
  },
  {
    actions: createBuildingScreenActions(destinationRoot),
    arguments: [
      {
        message: 'concept（kebab-case、例: inventory-item）',
        name: 'concept',
        schema: conceptSchema,
      },
      {
        message: 'kind（blank・collection・detail・form）',
        name: 'kind',
        schema: screenKindSchema,
      },
      {
        message: 'path（/ で始まる画面のパス、例: /inventory-items）',
        name: 'path',
        schema: screenPathSchema,
      },
    ],
    description: '画面 1 つ分の骨組みを作る',
    name: 'screen',
  },
];

// process.argv の先頭の 2 つは node と plop の実行ファイルのパスで、引数はその後に続く
const commandArgumentsStartIndex = 2;

const plopCommandPattern = /[\\/]plop[\\/]bin[\\/]plop\.js$/;

const listNamedArguments = (commandArguments: readonly string[]): ReadonlySet<string> =>
  new Set(
    commandArguments
      .filter((commandArgument) => commandArgument.startsWith('--'))
      .map((commandArgument) => commandArgument.replace(/^--/, '').replace(/=.*$/s, ''))
  );

const findMissingArgumentsMessage = ({
  commandArguments,
  definitions,
}: {
  readonly commandArguments: readonly string[];
  readonly definitions: readonly GeneratorDefinition[];
}): null | string => {
  const separatorIndex = commandArguments.indexOf('--');
  const argumentsBeforeSeparator =
    separatorIndex === -1 ? commandArguments : commandArguments.slice(0, separatorIndex);
  const definition = definitions.find(({ name }) => argumentsBeforeSeparator.includes(name));
  if (!isDefined(definition)) {
    return `generator の名前（${definitions.map(({ name }) => name).join('・')}）を指定してください`;
  }

  const namedArguments = listNamedArguments(commandArguments);
  const missingNames = definition.arguments
    .map(({ name }) => name)
    .filter((name) => !namedArguments.has(name));
  return missingNames.length === 0
    ? null
    : `端末から実行されていないため、足りない引数を尋ねられません。-- の後に ${missingNames.map((name) => `--${name}`).join('・')} を指定してください`;
};

// 端末がないと plop の対話が入力を待ち続けて止まるため、plop のコマンドから呼ばれたときは尋ねる前に引数が揃っているかを確かめて終える。
// node-plop から読まれたとき（generator のテスト）は引数を answers で渡すため確かめない
const exitWhenArgumentsAreMissing = (definitions: readonly GeneratorDefinition[]): void => {
  if (process.stdin.isTTY || !plopCommandPattern.test(process.argv[1] ?? '')) {
    return;
  }

  const message = findMissingArgumentsMessage({
    commandArguments: process.argv.slice(commandArgumentsStartIndex),
    definitions,
  });
  if (message === null) {
    return;
  }

  // plop のコマンドの利用者に足りない引数を伝える手段は標準エラー出力だけのため
  // eslint-disable-next-line no-console
  console.error(message);
  // 終了しないと plop が対話で入力を待ち続けて止まるため、尋ねる前にここで終える
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(1);
};

const registerGenerators = (plop: NodePlopAPI): void => {
  const definitions = buildGeneratorDefinitions(plop.getDestBasePath());
  exitWhenArgumentsAreMissing(definitions);
  for (const definition of definitions) {
    plop.setGenerator(definition.name, {
      actions: definition.actions,
      description: definition.description,
      prompts: definition.arguments.map(({ message, name, schema }) => ({
        message,
        name,
        type: 'input',
        validate: createValidating(schema),
      })),
    });
  }
};

export default registerGenerators;
