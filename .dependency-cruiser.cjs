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
        pathNot: ['\\.(test|spec)\\.(ts|tsx)$', '\\.d\\.ts$'],
      },
      to: {},
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
