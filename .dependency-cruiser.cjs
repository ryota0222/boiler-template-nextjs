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
        path: '^src/(api|app|controllers|features|shared-components|gateways|helpers|presenters|usecases)/',
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
        path: '^src/(api|app|controllers|features|shared-components|presenters|helpers|usecases)/',
        // gateway は usecase が定めた型（usecases/<concept>/gateways/）を実装する
        pathNot: '^src/helpers/[^/]*Client\\.ts$|^src/usecases/[^/]+/gateways/',
      },
    },
    {
      name: 'no-presenters-depend-on-non-entities',
      severity: 'error',
      from: {
        path: '^src/presenters/',
      },
      to: {
        path: '^src/(api|app|controllers|features|shared-components|gateways|helpers|usecases)/',
        // presenter は usecase が定めた型（usecases/<concept>/presenters/）を実装する
        pathNot: '^src/usecases/[^/]+/presenters/',
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
        path: '^src/(api|app|controllers|features|shared-components|gateways|presenters|helpers|usecases)/',
      },
    },
    {
      name: 'zod-only-in-entities-gateways-and-endpoints',
      severity: 'error',
      // 外から来るデータの検証は、エンティティ、gateway、エンドポイントの定義（とそのテスト）でだけ行う
      from: {
        path: '^src/',
        pathNot: '^src/(entities|gateways)/|^src/api/(endpoint|[^/]+/endpoints)(\\.test)?\\.ts$',
      },
      to: {
        path: '(^|/)node_modules/zod/',
      },
    },
    {
      name: 'route-handlers-call-controllers-only',
      severity: 'error',
      // Route Handler は controller の関数を HTTP メソッドの名前で書き出すだけにする（controllers.md）
      from: {
        path: '^src/app/.*/route\\.ts$',
      },
      to: {
        path: '^(src|packages)/',
        pathNot: '^src/controllers/',
      },
    },
    {
      name: 'features-must-not-depend-on-server-layers',
      severity: 'error',
      // サーバーの層を import すると Prisma などのサーバー専用のコードが画面のバンドルに入るため
      from: {
        path: '^src/(app|features|shared-components)/',
        pathNot: '^src/app/.*/route\\.ts$',
      },
      to: {
        path: '^src/(controllers|usecases|gateways|presenters)/',
      },
    },
    {
      name: 'api-depends-on-entities-only',
      severity: 'error',
      from: {
        path: '^src/api/',
      },
      to: {
        path: '^(src|packages)/',
        pathNot: '^src/(api|entities)/',
      },
    },
    {
      name: 'endpoints-must-not-depend-on-browser-code',
      severity: 'error',
      // エンドポイントの定義はサーバーからも import されるため、queries や mutations などの画面用のコードに依存できない
      from: {
        path: '^src/api/[^/]+/endpoints\\.ts$',
      },
      to: {
        path: '^src/api/',
        pathNot: '^src/api/endpoint\\.ts$',
      },
    },
    {
      name: 'api-helpers-stay-inside-api',
      severity: 'error',
      from: {
        path: '^src/',
        pathNot: '^src/api/',
      },
      to: {
        path: '^src/api/(endpoint|client)\\.ts$',
      },
    },
    {
      name: 'controllers-use-endpoint-definitions-only',
      severity: 'error',
      // controller が src/api/ から使えるのはエンドポイントの定義だけ
      from: {
        path: '^src/controllers/',
      },
      to: {
        path: '^src/api/',
        pathNot: '^src/api/[^/]+/endpoints\\.ts$',
      },
    },
    {
      name: 'only-controllers-use-endpoints',
      // サーバーの層で src/api/ を使えるのは controller だけ
      severity: 'error',
      from: {
        path: '^src/(usecases|gateways|presenters)/',
      },
      to: {
        path: '^src/api/',
      },
    },
    {
      name: 'usecases-must-not-depend-on-implementations',
      severity: 'error',
      // usecase は gateway と presenter の実装ではなく、usecases/<concept>/ に置いた型を介して使う
      from: {
        path: '^src/usecases/',
      },
      to: {
        path: '^src/(api|app|controllers|features|shared-components|gateways|presenters|stores)/',
      },
    },
    {
      name: 'only-gateways-use-database',
      severity: 'error',
      // DB のテストは、行を用意するなどの準備に Prisma のクライアントを直接使う
      from: {
        path: '^src/',
        pathNot: '^src/gateways/|\\.db\\.test\\.ts$',
      },
      to: {
        path: '^src/gateways/prismaClient\\.ts$|^prisma/generated/',
      },
    },
    {
      name: 'no-packages-depend-on-app',
      severity: 'error',
      // packages/ui はアプリの外でも使える部品の置き場であり、アプリの層に依存すると使い回せなくなる
      from: {
        path: '^packages/',
      },
      to: {
        path: '^src/',
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
      path: 'node_modules|prisma/generated',
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
