import {ESLintUtils} from '@typescript-eslint/utils';
import type {TSESTree} from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name: string) =>
    `https://shopify.dev/docs/api/shopify-app-remix/rules/${name}`,
);

type MessageIds = 'missingHeaders';
type Options = [];

export default createRule<Options, MessageIds>({
  name: 'shopify-app',
  meta: {
    //  The rule is identifying code that either will cause an error or may cause a confusing behavior. Developers should consider this a high priority to resolve.
    type: 'problem',
    docs: {
      description: 'Missing headers export',
      url: 'https://shopify.dev/',
    },
    fixable: 'code',
    schema: [],
    messages: {
      missingHeaders:
        'Files using authenticate.admin() or authenticate.public.* must export a headers function',
    },
  },
  defaultOptions: [],
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
      'ExportNamedDeclaration[declaration.type="VariableDeclaration"]':
        function (
          node: TSESTree.ExportNamedDeclaration & {
            declaration: TSESTree.VariableDeclaration;
          },
        ) {
          const declarations = node.declaration.declarations;
          if (
            declarations.some(
              (declaration) =>
                (declaration.id as TSESTree.Identifier).name === 'headers',
            )
          ) {
            hasHeadersExport = true;
          }
        },
      'ExportNamedDeclaration[declaration.type="FunctionDeclaration"][declaration.id.name="headers"]':
        function () {
          hasHeadersExport = true;
        },
      // When we finish processing the file, check if we need both and only have one
      'Program:exit': function (node: TSESTree.Program) {
        if (!hasAuthenticateCall || hasHeadersExport) return;

        const isTypeScript =
          context.getFilename().endsWith('.ts') ||
          context.getFilename().endsWith('.tsx');

        const hasBoundaryImport = node.body.some(
          (statement): statement is TSESTree.ImportDeclaration =>
            statement.type === 'ImportDeclaration' &&
            statement.source.value === '@shopify/shopify-app-remix/server' &&
            statement.specifiers.some(
              (specifier): specifier is TSESTree.ImportSpecifier =>
                specifier.type === 'ImportSpecifier' &&
                (specifier.imported as TSESTree.Identifier).name === 'boundary',
            ),
        );

        const hasHeadersTypeImport = node.body.some(
          (statement): statement is TSESTree.ImportDeclaration =>
            statement.type === 'ImportDeclaration' &&
            statement.source.value === '@remix-run/node' &&
            statement.specifiers.some(
              (specifier): specifier is TSESTree.ImportSpecifier =>
                specifier.type === 'ImportSpecifier' &&
                (specifier.imported as TSESTree.Identifier).name ===
                  'HeadersFunction' &&
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
          ? '\n\nexport const headers: HeadersFunction = (headersArgs) => {\n  return boundary.headers(headersArgs);\n};\n'
          : '\n\nexport const headers = (headersArgs) => {\n  return boundary.headers(headersArgs);\n};';

        context.report({
          node,
          messageId: 'missingHeaders',
          fix(fixer) {
            const fixes = [];

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
});
