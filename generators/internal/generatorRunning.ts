import nodePlop from 'node-plop';
import { readdir, readFile } from 'node:fs/promises';
import nodePath from 'node:path';

// 引数の検査と既存のファイルとの重なりの検査は actions の中で行うため、prompts を通さずに answers を渡しても同じ検査を通る
export const runGenerator = async ({
  answers,
  destination,
  generatorName,
}: {
  readonly answers: Readonly<Record<string, string>>;
  readonly destination: string;
  readonly generatorName: string;
}): Promise<{
  readonly changes: readonly unknown[];
  readonly failures: readonly unknown[];
}> => {
  const plop = await nodePlop(nodePath.resolve(destination, 'plopfile.ts'), {
    destBasePath: destination,
    force: false,
  });
  return plop.getGenerator(generatorName).runActions({ ...answers });
};

// 比べるのは generator が書く src だけ。packages や node_modules は generator が書き換えないため
export const readSourceFiles = async (
  destination: string
): Promise<Readonly<Record<string, string>>> => {
  const entries = await readdir(nodePath.resolve(destination, 'src'), {
    recursive: true,
    withFileTypes: true,
  });
  const paths = entries
    .filter((entry) => entry.isFile())
    .map((entry) => nodePath.resolve(entry.parentPath, entry.name));
  return Object.fromEntries(
    await Promise.all(paths.map(async (path) => [path, await readFile(path, 'utf8')] as const))
  );
};
