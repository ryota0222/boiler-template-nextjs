/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      from: {},
      to: {
        circular: true,
      },
    },
    {
      name: 'no-orphans',
      severity: 'warn',
      from: {
        orphan: true,
        pathNot: [
          '\\.(test|spec)\\.(ts|tsx)$',
          '\\.d\\.ts$',
          'src/app/.*(layout|page|loading|error|not-found|template|default)\\.tsx$',
        ],
      },
      to: {},
    },
    {
      name: 'no-shared-components-depend-on-features',
      severity: 'error',
      from: {
        path: '^src/shared-components/',
      },
      to: {
        path: '^src/features/',
      },
    },
    {
      name: 'no-entities-depend-on-other-layers',
      severity: 'error',
      from: {
        path: '^src/entities/',
      },
      to: {
        path: '^src/(app|features|shared-components|gateways|helpers)/',
      },
    },
    {
      name: 'no-gateways-depend-on-non-entities',
      severity: 'error',
      // helpers はライブラリ設定（axios や dayjs のインスタンス）の置き場であり、
      // それを使うのは I/O を行う gateway である。helpers 全体を禁じると
      // helpers.md が例示する apiClient のパターン自体が実行不能になるため、
      // <name>Client.ts というライブラリ設定ファイルに限って参照を許す
      from: {
        path: '^src/gateways/',
      },
      to: {
        path: '^src/(app|features|shared-components|presenters|helpers)/',
        pathNot: '^src/helpers/[^/]*Client\\.ts$',
      },
    },
    {
      name: 'no-presenters-depend-on-non-entities',
      severity: 'error',
      from: {
        path: '^src/presenters/',
      },
      to: {
        path: '^src/(app|features|shared-components|gateways|helpers)/',
      },
    },
    {
      name: 'no-helpers-depend-on-other-layers',
      severity: 'error',
      from: {
        path: '^src/helpers/',
      },
      to: {
        path: '^src/(app|features|shared-components|entities|gateways|presenters)/',
      },
    },
    {
      name: 'no-stores-depend-on-non-entities',
      severity: 'error',
      from: {
        path: '^src/stores/',
      },
      to: {
        path: '^src/(app|features|shared-components|gateways|presenters|helpers)/',
      },
    },
    {
      name: 'no-internal-cross-access',
      severity: 'error',
      // $1 は from.path のキャプチャグループしか参照できない（dependency-cruiser の
      // group matching 仕様）。from に path を置かず pathNot のグループを参照しようとすると
      // 後方参照が解決されず、直接の親からの import まで違反になる
      from: {
        path: '^(.+?)/[^/]+$',
        pathNot: '(^|/)internal/',
      },
      to: {
        path: '(^|/)internal/',
        pathNot: '^$1/internal/',
      },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.json',
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
    },
  },
};
