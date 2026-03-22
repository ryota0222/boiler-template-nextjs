import eslint from '@eslint/js';
import nextPlugin from '@next/eslint-plugin-next';
import checkFile from 'eslint-plugin-check-file';
import { defineConfig } from 'eslint/config';
import perfectionist from 'eslint-plugin-perfectionist';
import unicorn from 'eslint-plugin-unicorn';
import tseslint from 'typescript-eslint';

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  perfectionist.configs['recommended-natural'],
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
    ignores: ['node_modules/', '.next/', 'dist/', 'coverage/', '*.config.ts', '*.config.mjs'],
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
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      complexity: ['error', { max: 10 }],
      'func-style': ['error', 'expression'],
      'max-params': ['error', { max: 1 }],
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
      'check-file/filename-naming-convention': [
        'error',
        { '**/*.{ts,tsx}': 'CAMEL_CASE' },
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
    files: ['src/components/**/*.tsx'],
    rules: {
      'max-params': ['error', { max: 1 }],
    },
  },
  {
    files: ['src/**/*.test.{ts,tsx}'],
    rules: {
      '@typescript-eslint/consistent-type-assertions': 'off',
      '@typescript-eslint/no-magic-numbers': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  }
);
