import type { Rule } from 'eslint';

import { isNonNullish } from 'remeda';

const noNestedIf: Rule.RuleModule = {
  create(context): Rule.RuleListener {
    return {
      IfStatement(node): void {
        const parent = node.parent;

        if (parent.type === 'IfStatement' && parent.alternate === node) {
          return;
        }

        let ancestor: Rule.Node = parent;
        // 走査終了条件は各 if 文内の return で保証されるため
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        while (true) {
          if (
            ancestor.type === 'ArrowFunctionExpression' ||
            ancestor.type === 'FunctionDeclaration' ||
            ancestor.type === 'FunctionExpression'
          ) {
            return;
          }
          if (ancestor.type === 'IfStatement') {
            context.report({ messageId: 'noNestedIf', node });
            return;
          }
          if (!isNonNullish(ancestor.parent)) {
            return;
          }
          ancestor = ancestor.parent;
        }
      },
    };
  },
  meta: {
    docs: {
      description: 'if文のネストを禁止し、早期リターンを促す',
    },
    messages: {
      noNestedIf: 'if文のネストは禁止です。早期リターンを使用してください。',
    },
    schema: [],
    type: 'suggestion',
  },
};

export default noNestedIf;
