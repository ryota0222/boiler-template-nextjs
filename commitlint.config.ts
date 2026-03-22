import type { UserConfig } from '@commitlint/types';

const config: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore'],
    ],
    'type-empty': [2, 'never'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'subject-case': [0],
    'header-max-length': [2, 'always', 100],
    'body-max-line-length': [2, 'always', 200],
    'footer-max-line-length': [2, 'always', 200],
    'body-required-for-type': [2, 'always'],
  },
  plugins: [
    {
      rules: {
        'body-required-for-type': ({ type, body }) => {
          const typesRequiringBody = ['fix', 'refactor'];
          if (typesRequiringBody.includes(type ?? '') && !body) {
            return [false, `型が "${type}" の場合、本文（body）は必須です`];
          }
          return [true];
        },
      },
    },
  ],
};

export default config;
