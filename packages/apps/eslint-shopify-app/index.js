const shopifyAppRule = {
  meta: {
    //  The rule is identifying code that either will cause an error or may cause a confusing behavior. Developers should consider this a high priority to resolve.
    type: 'problem',
    docs: {
      description: 'Missing headers export',
      url: 'https://shopify.dev/',
    },
    fixable: 'code',
    schema: [],
  },
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
        function (node) {
          const declarations = node.declaration.declarations;
          if (
            declarations.some(
              (declaration) => declaration.id.name === 'headers',
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
      'Program:exit': function (node) {
        if (!hasAuthenticateCall || hasHeadersExport) return;

        const isTypeScript =
          context.getFilename().endsWith('.ts') ||
          context.getFilename().endsWith('.tsx');

        const hasBoundaryImport = node.body.some(
          (statement) =>
            statement.type === 'ImportDeclaration' &&
            statement.source.value === '@shopify/shopify-app-remix/server' &&
            statement.specifiers.some(
              (specifier) =>
                specifier.type === 'ImportSpecifier' &&
                specifier.imported.name === 'boundary',
            ),
        );

        const hasHeadersTypeImport = node.body.some(
          (statement) =>
            statement.type === 'ImportDeclaration' &&
            statement.source.value === '@remix-run/node' &&
            statement.specifiers.some(
              (specifier) =>
                specifier.type === 'ImportSpecifier' &&
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
          ? '\n\nexport const headers: HeadersFunction = (headersArgs) => {\n  return boundary.headers(headersArgs);\n};\n'
          : '\n\nexport const headers = (headersArgs) => {\n  return boundary.headers(headersArgs);\n};\n';

        context.report({
          node,
          message:
            'Files using authenticate.admin() or authenticate.public.* must export a headers function',
          fix(fixer) {
            return [
              hasBoundaryImport
                ? null
                : fixer.insertTextAfter(node.body[0], importFix),
              isTypeScript && !hasHeadersTypeImport
                ? fixer.insertTextAfter(node.body[0], typeImportFix)
                : null,
              fixer.insertTextAfter(node, headersFix),
            ].filter(Boolean);
          },
        });
      },
    };
  },
};

export default shopifyAppRule;
