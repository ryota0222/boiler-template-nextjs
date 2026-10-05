import { runCommand } from '@generators/internal/commandRunning';
import { existsSync, mkdtempSync } from 'node:fs';
import { copyFile, cp, mkdir, readdir, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import nodePath from 'node:path';

import type { Result } from '@/entities/result';

const projectRoot = nodePath.resolve(import.meta.dirname, '..', '..');

const listProjectFiles = async (): Promise<Result<readonly string[]>> => {
  // コミット前の新しいファイルも generator のテストの対象に含めるため、追跡中のファイルに加えて ignore されていない未追跡のファイルも写す
  const { exitCode, output } = await runCommand({
    command: 'git',
    commandArguments: ['ls-files', '--cached', '--others', '--exclude-standard'],
    directory: projectRoot,
  });
  if (exitCode !== 0) {
    return {
      error: new Error(`プロジェクトのファイルを git ls-files で一覧できません\n${output}`),
      ok: false,
    };
  }

  return {
    ok: true,
    value: output
      .split('\n')
      .filter((path) => path !== '' && existsSync(nodePath.resolve(projectRoot, path))),
  };
};

const copyProjectFile = async ({
  destination,
  path,
}: {
  readonly destination: string;
  readonly path: string;
}): Promise<void> => {
  await mkdir(nodePath.dirname(nodePath.resolve(destination, path)), { recursive: true });
  await copyFile(nodePath.resolve(projectRoot, path), nodePath.resolve(destination, path));
};

const workspacePackageScope = '@template';

const linkWorkspacePackages = async (destination: string): Promise<void> => {
  await mkdir(nodePath.resolve(destination, 'node_modules', workspacePackageScope), {
    recursive: true,
  });
  const workspacePackages = await readdir(
    nodePath.resolve(projectRoot, 'node_modules', workspacePackageScope)
  );
  await Promise.all(
    workspacePackages.map((workspacePackage) =>
      symlink(
        nodePath.join('..', '..', 'packages', workspacePackage),
        nodePath.resolve(destination, 'node_modules', workspacePackageScope, workspacePackage)
      )
    )
  );
};

// Vite・Storybook・tsc の作業用のキャッシュ。元のものへリンクすると、写した先の Vitest が元のプロジェクトのキャッシュを
// 書き換え、元のプロジェクトで同時に走る Vitest が書きかけの依存を読んで失敗するため、写した先には持ち込まない
const cacheDirectoryNames: ReadonlySet<string> = new Set(['.cache', '.vite', '.vite-temp']);

// ルートの node_modules は依存の実体（.pnpm）を持ち大きいため、項目ごとに元のものへのシンボリックリンクにして install を省く。
// @template/* だけは写した先の packages/* を指すように張り直し、写した先の tsc と dependency-cruiser が
// 本物と同じ packages/ui/src のパスでパッケージを読むようにする
const linkRootNodeModules = async (destination: string): Promise<void> => {
  await mkdir(nodePath.resolve(destination, 'node_modules'), { recursive: true });
  const entries = await readdir(nodePath.resolve(projectRoot, 'node_modules'));
  await Promise.all(
    entries
      .filter((entry) => entry !== workspacePackageScope && !cacheDirectoryNames.has(entry))
      .map((entry) =>
        symlink(
          nodePath.resolve(projectRoot, 'node_modules', entry),
          nodePath.resolve(destination, 'node_modules', entry)
        )
      )
  );
  await linkWorkspacePackages(destination);
};

// pnpm が packages/* の node_modules に置くリンクは相対パスのため、リンクのまま写すと写した先のルートの node_modules を指す
const copyPackageNodeModules = async (destination: string): Promise<void> => {
  const packageEntries = await readdir(nodePath.resolve(projectRoot, 'packages'), {
    withFileTypes: true,
  });
  const nodeModulesDirectories = packageEntries
    .map((entry) => nodePath.join('packages', entry.name, 'node_modules'))
    .filter((directory) => existsSync(nodePath.resolve(projectRoot, directory)));
  await Promise.all(
    nodeModulesDirectories.map((directory) =>
      cp(nodePath.resolve(projectRoot, directory), nodePath.resolve(destination, directory), {
        filter: (source) => !cacheDirectoryNames.has(nodePath.basename(source)),
        recursive: true,
        verbatimSymlinks: true,
      })
    )
  );
};

// テスト用の一時ディレクトリを同期で作るのは、テストファイルの読み込み時に作り、失敗したときも afterAll で消せるようにするため
export const createTemporaryDirectory = (): string =>
  mkdtempSync(nodePath.join(tmpdir(), 'nextjs-template-generators-'));

// ignore されている Prisma Client（prisma/generated）は型検査に要るため別に写す
export const copyProject = async (destination: string): Promise<Result<null>> => {
  const filesResult = await listProjectFiles();
  if (!filesResult.ok) {
    return filesResult;
  }

  await Promise.all(filesResult.value.map((path) => copyProjectFile({ destination, path })));
  await cp(
    nodePath.resolve(projectRoot, 'prisma', 'generated'),
    nodePath.resolve(destination, 'prisma', 'generated'),
    { recursive: true }
  );
  await linkRootNodeModules(destination);
  await copyPackageNodeModules(destination);
  return { ok: true, value: null };
};
