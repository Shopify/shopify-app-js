import {ESLintUtils} from '@typescript-eslint/utils';
import * as ts from 'typescript';

import {createRule} from '../utils';

export const rule = createRule({
  create(context) {
    const services = ESLintUtils.getParserServices(context);

    return {
      ForInStatement(node) {
        const type = services.getTypeAtLocation(node.right);

        if (type.symbol.flags & ts.SymbolFlags.Enum) {
          context.report({
            messageId: 'loopOverEnum',
            node: node.right,
          });
        }
      },
    };
  },
  meta: {
    docs: {
      description: 'Avoid looping over enums.',
      recommended: true,
      requiresTypeChecking: true,
    },
    messages: {
      loopOverEnum: 'Do not loop over enums.',
    },
    type: 'suggestion',
    schema: [],
  },
  name: 'no-loop-over-enum',
  defaultOptions: [],
});
