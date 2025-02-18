import type {TSESTree, TSESLint} from '@typescript-eslint/utils';

import {createRule} from '../utils';

const AUTHENTICATE_SELECTORS = [
  // Direct admin calls
  'CallExpression[callee.object.object.name="authenticate"][callee.object.property.name="admin"][callee.property.name="call"]',
  'CallExpression[callee.object.name="authenticate"][callee.property.name="admin"]',
  // Awaited admin calls
  'AwaitExpression > CallExpression[callee.object.name="authenticate"][callee.property.name="admin"]',
  // Public calls
  'CallExpression[callee.object.object.object.name="authenticate"][callee.object.object.property.name="public"]',
  'AwaitExpression > CallExpression[callee.object.object.name="authenticate"][callee.object.property.name="public"]',
];

const IMPORT_FIXES = {
  BOUNDARY: '\nimport {boundary} from "@shopify/shopify-app-remix/server";',
  HEADERS_TYPE: '\nimport type {HeadersFunction} from "@remix-run/node";',
} as const;

const HEADERS_EXPORT_FIXES = {
  TYPESCRIPT:
    '\nexport const headers: HeadersFunction = (headersArgs) => {\n  return boundary.headers(headersArgs);\n};',
  JAVASCRIPT:
    '\nexport const headers = (headersArgs) => {\n  return boundary.headers(headersArgs);\n};',
} as const;

function checkHeadersNamedExport(
  node: TSESTree.ExportNamedDeclaration,
): boolean {
  if (node.declaration?.type === 'VariableDeclaration') {
    return node.declaration.declarations.some(
      (declaration) =>
        declaration.type === 'VariableDeclarator' &&
        declaration.id.type === 'Identifier' &&
        declaration.id.name === 'headers',
    );
  }

  return (
    node.declaration?.type === 'FunctionDeclaration' &&
    node.declaration.id?.name === 'headers'
  );
}

function hasRequiredImport(
  node: TSESTree.Program,
  packageName: string,
  importName: string,
): boolean {
  return node.body.some(
    (statement): statement is TSESTree.ImportDeclaration =>
      statement.type === 'ImportDeclaration' &&
      statement.source.value === packageName &&
      statement.specifiers.some(
        (specifier) =>
          specifier.type === 'ImportSpecifier' &&
          'imported' in specifier &&
          specifier.imported.type === 'Identifier' &&
          specifier.imported.name === importName,
      ),
  );
}

function generateFixes(
  node: TSESTree.Program,
  fixer: TSESLint.RuleFixer,
  {
    isTypeScript,
    hasBoundaryImport,
    hasHeadersTypeImport,
  }: {
    isTypeScript: boolean;
    hasBoundaryImport: boolean;
    hasHeadersTypeImport: boolean;
  },
): TSESLint.RuleFix[] {
  const fixes: TSESLint.RuleFix[] = [];
  const lastImport = [...node.body]
    .reverse()
    .find(
      (statement): statement is TSESTree.ImportDeclaration =>
        statement.type === 'ImportDeclaration',
    );
  const targetNode = lastImport || node.body[0];

  // Add required imports
  if (!hasBoundaryImport) {
    fixes.push(fixer.insertTextAfter(targetNode, IMPORT_FIXES.BOUNDARY));
  }

  if (isTypeScript && !hasHeadersTypeImport) {
    fixes.push(fixer.insertTextAfter(targetNode, IMPORT_FIXES.HEADERS_TYPE));
  }

  // Add headers export
  const headersFix = isTypeScript
    ? HEADERS_EXPORT_FIXES.TYPESCRIPT
    : HEADERS_EXPORT_FIXES.JAVASCRIPT;
  fixes.push(fixer.insertTextAfter(node, headersFix));

  return fixes;
}

export const rule = createRule({
  create(context) {
    let hasAuthenticateCall = false;
    let hasHeadersExport = false;

    return {
      [AUTHENTICATE_SELECTORS.join(', ')]() {
        hasAuthenticateCall = true;
      },

      ExportNamedDeclaration(node: TSESTree.ExportNamedDeclaration) {
        if (checkHeadersNamedExport(node)) {
          hasHeadersExport = true;
        }
      },

      'Program:exit': function (node: TSESTree.Program) {
        if (!hasAuthenticateCall || hasHeadersExport) return;

        const filename = context.getFilename();
        const isTypeScript =
          filename.endsWith('.ts') || filename.endsWith('.tsx');
        const hasBoundaryImport = hasRequiredImport(
          node,
          '@shopify/shopify-app-remix/server',
          'boundary',
        );
        const hasHeadersTypeImport = hasRequiredImport(
          node,
          '@remix-run/node',
          'HeadersFunction',
        );

        context.report({
          node,
          messageId: 'missingHeadersExport',
          fix(fixer: TSESLint.RuleFixer) {
            return generateFixes(node, fixer, {
              isTypeScript,
              hasBoundaryImport,
              hasHeadersTypeImport,
            });
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
