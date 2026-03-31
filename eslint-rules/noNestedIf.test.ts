import { RuleTester } from 'eslint';
import { describe, it } from 'vitest';

import noNestedIf from './noNestedIf.js';

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester();

ruleTester.run('noNestedIf', noNestedIf, {
  invalid: [
    {
      code: 'const fn = () => { if (a) { if (b) {} } };',
      errors: [{ messageId: 'noNestedIf' }],
      name: 'if文の中にif文がある場合、エラーが発生すること',
    },
    {
      code: 'const fn = () => { if (a) { if (b) return; } };',
      errors: [{ messageId: 'noNestedIf' }],
      name: 'if文の中に早期リターンのif文がある場合、エラーが発生すること',
    },
    {
      code: 'const fn = () => { if (a) {} else { if (b) {} } };',
      errors: [{ messageId: 'noNestedIf' }],
      name: 'elseブロック内にif文がある場合、エラーが発生すること',
    },
  ],
  valid: [
    {
      code: 'const fn = () => { if (a) {} };',
      name: 'シンプルなif文の場合、エラーが発生しないこと',
    },
    {
      code: 'const fn = () => { if (a) {} else if (b) {} };',
      name: 'else-ifチェーンの場合、エラーが発生しないこと',
    },
    {
      code: 'const fn = () => { for (const x of arr) { if (x) {} } };',
      name: 'for文内にif文がある場合、エラーが発生しないこと',
    },
    {
      code: 'const fn = () => { while (cond) { if (x) {} } };',
      name: 'while文内にif文がある場合、エラーが発生しないこと',
    },
    {
      code: 'const fn = () => { try { if (a) {} } catch (e) {} };',
      name: 'try文内にif文がある場合、エラーが発生しないこと',
    },
    {
      code: 'const fn = () => { if (a) { const inner = () => { if (b) {} }; } };',
      name: '関数境界を越えてif文がネストされている場合、エラーが発生しないこと',
    },
  ],
});
