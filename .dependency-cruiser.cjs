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
      from: {
        path: '^src/gateways/',
      },
      to: {
        path: '^src/(app|features|shared-components|presenters|helpers)/',
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
      name: 'no-internal-cross-access',
      severity: 'error',
      from: {
        pathNot: '(^|/)internal/',
      },
      to: {
        path: '(^|/)internal/',
        pathNot: '$1internal/',
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
