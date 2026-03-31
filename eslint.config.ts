import eslint from '@eslint/js';
import nextPlugin from '@next/eslint-plugin-next';
import checkFile from 'eslint-plugin-check-file';
import perfectionist from 'eslint-plugin-perfectionist';
import playwright from 'eslint-plugin-playwright';
import storybook from 'eslint-plugin-storybook';
import unicorn from 'eslint-plugin-unicorn';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import noNestedIf from './eslint-rules/noNestedIf.js';

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  perfectionist.configs['recommended-natural'],
  ...storybook.configs['flat/recommended'].map((config) =>
    Object.fromEntries(Object.entries(config).filter(([, value]) => value !== undefined))
  ),
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    plugins: {
      local: { rules: { 'no-nested-if': noNestedIf } },
    },
  },
  {
    ignores: [
      'node_modules/',
      '.next/',
      'dist/',
      'coverage/',
      '*.config.ts',
      '*.config.mjs',
      '*.cjs',
      '.storybook/',
    ],
  },
  {
    plugins: { '@next/next': nextPlugin },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
  },
  {
    plugins: { unicorn },
    rules: {
      ...unicorn.configs.recommended.rules,
      'unicorn/filename-case': 'off',
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/no-null': 'off',
    },
  },
  {
    rules: {
      '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'never' }],
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowExpressions: true,
          allowConciseArrowFunctionExpressionsStartingWithVoid: true,
        },
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          format: ['camelCase', 'PascalCase'],
          selector: ['variable', 'function'],
        },
        {
          format: ['camelCase'],
          selector: ['parameter'],
        },
        {
          format: ['camelCase'],
          leadingUnderscore: 'allow',
          modifiers: ['unused'],
          selector: 'parameter',
        },
        {
          format: ['PascalCase'],
          selector: ['typeLike'],
        },
      ],
      '@typescript-eslint/no-magic-numbers': [
        'error',
        {
          enforceConst: true,
          ignoreEnums: true,
          ignoreNumericLiteralTypes: true,
          ignoreReadonlyClassProperties: true,
          ignoreTypeIndexes: true,
          ignore: [0, 1, -1],
        },
      ],
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } },
      ],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/strict-boolean-expressions': [
        'error',
        {
          allowAny: false,
          allowNullableBoolean: false,
          allowNullableEnum: false,
          allowNullableNumber: false,
          allowNullableObject: false,
          allowNullableString: false,
          allowNumber: false,
          allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing: false,
          allowString: false,
        },
      ],
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      complexity: ['error', { max: 10 }],
      curly: ['error', 'all'],
      eqeqeq: ['error', 'always'],
      'func-style': ['error', 'expression'],
      'id-length': ['error', { exceptionPatterns: ['_'] }],
      'local/no-nested-if': 'error',
      'max-depth': ['error', { max: 2 }],
      'max-params': ['error', { max: 1 }],
      'no-console': 'error',
      'no-undefined': 'error',
      'no-implicit-coercion': 'error',
      'no-inline-comments': 'error',
      'no-underscore-dangle': 'error',
      'one-var': ['error', 'never'],
      'prefer-template': 'error',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['./*', '../*'],
              message: '相対パスではなく @/ エイリアスを使用してください',
            },
          ],
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          message: 'オプショナル引数は禁止です。引数は常に必須にしてください',
          selector:
            'FunctionDeclaration > Identifier[optional=true], ArrowFunctionExpression > Identifier[optional=true], TSParameterProperty[parameter.optional=true]',
        },
        {
          message: 'オプショナル引数は禁止です。引数は常に必須にしてください',
          selector:
            ':matches(FunctionDeclaration, FunctionExpression, ArrowFunctionExpression) > :matches(Identifier[optional=true], AssignmentPattern)',
        },
      ],
    },
  },
  {
    plugins: { 'check-file': checkFile },
    rules: {
      'check-file/filename-blocklist': [
        'error',
        {
          '**/*.spec.ts': '*.test.ts を使用してください',
          '**/*.spec.tsx': '*.test.tsx を使用してください',
        },
      ],
      'check-file/filename-naming-convention': [
        'error',
        { '**/*.ts': 'CAMEL_CASE', '**/*.tsx': 'PASCAL_CASE' },
        { ignoreMiddleExtensions: true },
      ],
      'check-file/folder-naming-convention': ['error', { 'src/**/': 'KEBAB_CASE' }],
    },
  },
  {
    files: ['src/app/**/{layout,page,loading,error,not-found,template,default}.tsx'],
    rules: {
      'check-file/filename-naming-convention': 'off',
      '@typescript-eslint/naming-convention': 'off',
      'max-params': 'off',
    },
  },
  {
    files: ['src/shared-components/**/*.tsx', 'src/features/**/*.tsx'],
    rules: {
      'max-params': ['error', { max: 1 }],
    },
  },
  {
    files: ['**/*.tsx'],
    rules: {
      'max-lines-per-function': ['error', { max: 150, skipBlankLines: true, skipComments: true }],
      'no-restricted-syntax': [
        'error',
        {
          message: 'オプショナル引数は禁止です。引数は常に必須にしてください',
          selector:
            'FunctionDeclaration > Identifier[optional=true], ArrowFunctionExpression > Identifier[optional=true], TSParameterProperty[parameter.optional=true]',
        },
        {
          message: 'オプショナル引数は禁止です。引数は常に必須にしてください',
          selector:
            ':matches(FunctionDeclaration, FunctionExpression, ArrowFunctionExpression) > :matches(Identifier[optional=true], AssignmentPattern)',
        },
        {
          message:
            'TSX内で data-* 属性は使用禁止です。セマンティックな要素やロールを使用してください',
          selector: 'JSXAttribute[name.name=/^data-/]',
        },
        {
          message: 'propsのスプレッド展開は禁止です。必要なpropsを明示的に渡してください',
          selector: 'JSXSpreadAttribute',
        },
      ],
    },
  },
  {
    files: ['src/shared-components/shadcn/**/*.tsx'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          message: 'オプショナル引数は禁止です。引数は常に必須にしてください',
          selector:
            'FunctionDeclaration > Identifier[optional=true], ArrowFunctionExpression > Identifier[optional=true], TSParameterProperty[parameter.optional=true]',
        },
        {
          message: 'オプショナル引数は禁止です。引数は常に必須にしてください',
          selector:
            ':matches(FunctionDeclaration, FunctionExpression, ArrowFunctionExpression) > :matches(Identifier[optional=true], AssignmentPattern)',
        },
      ],
    },
  },
  {
    files: ['src/**/*.test.{ts,tsx}'],
    rules: {
      '@typescript-eslint/consistent-type-assertions': 'off',
      '@typescript-eslint/no-magic-numbers': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/switch-exhaustiveness-check': 'off',
      'max-lines-per-function': 'off',
      'no-console': 'off',
    },
  },
  {
    files: ['eslint-rules/**/*.ts'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
  {
    ...playwright.configs['flat/recommended'],
    files: ['e2e/**/*.test.ts'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      '@typescript-eslint/no-magic-numbers': 'off',
      'max-lines-per-function': 'off',
    },
  }
);
