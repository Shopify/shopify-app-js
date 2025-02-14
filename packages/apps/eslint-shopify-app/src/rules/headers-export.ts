import type {TSESTree, TSESLint} from '@typescript-eslint/utils';

import {createRule} from '../utils';

export const rule = createRule({
  create(context) {
    let hasAuthenticateCall = false;
    let hasHeadersExport = false;

    return {
      // Check for authenticate.admin(request) calls
      'CallExpression[callee.object.object.name="authenticate"][callee.object.property.name="admin"][callee.property.name="call"]':
        function () {
          hasAuthenticateCall = true;
        },
      'CallExpression[callee.object.name="authenticate"][callee.property.name="admin"]':
        function () {
          hasAuthenticateCall = true;
        },
      // Check for await authenticate.admin(request) calls
      'AwaitExpression > CallExpression[callee.object.name="authenticate"][callee.property.name="admin"]':
        function () {
          hasAuthenticateCall = true;
        },
      // Check for authenticate.public.* calls
      'CallExpression[callee.object.object.object.name="authenticate"][callee.object.object.property.name="public"]':
        function () {
          hasAuthenticateCall = true;
        },
      'AwaitExpression > CallExpression[callee.object.object.name="authenticate"][callee.object.property.name="public"]':
        function () {
          hasAuthenticateCall = true;
        },
      // Check for headers export
      ExportNamedDeclaration(node: TSESTree.ExportNamedDeclaration) {
        if (node.declaration?.type === 'VariableDeclaration') {
          const declarations = node.declaration.declarations;
          if (
            declarations.some(
              (declaration) =>
                declaration.type === 'VariableDeclarator' &&
                declaration.id.type === 'Identifier' &&
                declaration.id.name === 'headers',
            )
          ) {
            hasHeadersExport = true;
          }
        } else if (
          node.declaration?.type === 'FunctionDeclaration' &&
          node.declaration.id?.name === 'headers'
        ) {
          hasHeadersExport = true;
        }
      },
      // When we finish processing the file, check if we need both and only have one
      'Program:exit': function (node: TSESTree.Program) {
        if (!hasAuthenticateCall || hasHeadersExport) return;

        const filename = context.getFilename();
        const isTypeScript =
          filename.endsWith('.ts') || filename.endsWith('.tsx');

        const hasBoundaryImport = node.body.some(
          (statement): statement is TSESTree.ImportDeclaration =>
            statement.type === 'ImportDeclaration' &&
            statement.source.value === '@shopify/shopify-app-remix/server' &&
            statement.specifiers.some(
              (specifier) =>
                specifier.type === 'ImportSpecifier' &&
                'imported' in specifier &&
                specifier.imported.type === 'Identifier' &&
                specifier.imported.name === 'boundary',
            ),
        );

        const hasHeadersTypeImport = node.body.some(
          (statement): statement is TSESTree.ImportDeclaration =>
            statement.type === 'ImportDeclaration' &&
            statement.source.value === '@remix-run/node' &&
            statement.specifiers.some(
              (specifier) =>
                specifier.type === 'ImportSpecifier' &&
                'imported' in specifier &&
                specifier.imported.type === 'Identifier' &&
                specifier.imported.name === 'HeadersFunction' &&
                specifier.importKind === 'type',
            ),
        );

        const importFix = hasBoundaryImport
          ? ''
          : '\nimport {boundary} from "@shopify/shopify-app-remix/server";';
        const typeImportFix =
          isTypeScript && !hasHeadersTypeImport
            ? '\nimport type {HeadersFunction} from "@remix-run/node";'
            : '';
        const headersFix = isTypeScript
          ? '\nexport const headers: HeadersFunction = (headersArgs) => {\n  return boundary.headers(headersArgs);\n};'
          : '\nexport const headers = (headersArgs) => {\n  return boundary.headers(headersArgs);};';

        context.report({
          node,
          messageId: 'missingHeadersExport',
          fix(fixer: TSESLint.RuleFixer) {
            const fixes: TSESLint.RuleFix[] = [];

            if (!hasBoundaryImport) {
              fixes.push(fixer.insertTextAfter(node.body[0], importFix));
            }

            if (isTypeScript && !hasHeadersTypeImport) {
              fixes.push(fixer.insertTextAfter(node.body[0], typeImportFix));
            }

            fixes.push(fixer.insertTextAfter(node, headersFix));

            return fixes;
          },
        });
      },
    };
  },
  meta: {
    type: 'problem',
    docs: {
      description: 'Missing headers export',
      recommended: true,
      requiresTypeChecking: true,
      url: 'https://shopify.dev/',
    },
    messages: {
      missingHeadersExport:
        'Files using authenticate.admin() or authenticate.public.* must export a headers function',
    },
    fixable: 'code',
    schema: [],
  },
  name: 'headers-export',
  defaultOptions: [],
});
