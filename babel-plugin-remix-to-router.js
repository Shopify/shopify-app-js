/**
 * Babel plugin to transform Remix imports to React Router
 */
export default function remixToReactRouter({types: t}) {
  return {
    name: 'remix-to-react-router',
    visitor: {
      // Transform ES module imports from Remix to React Router
      ImportDeclaration(path) {
        // Early return if node or source is missing
        if (!path.node || !path.node.source || !path.node.source.value) return;

        const source = path.node.source.value;
        if (typeof source !== 'string') return;

        if (source.includes('@remix-run/')) {
          const packageMap = {
            '@remix-run/react': 'react-router-dom',
            '@remix-run/node': 'react-router',
            '@remix-run/server-runtime': 'react-router',
          };

          if (packageMap[source]) {
            path.node.source.value = packageMap[source];
          }

          // Transform imported APIs
          if (Array.isArray(path.node.specifiers)) {
            path.node.specifiers.forEach((specifier) => {
              if (!t.isImportSpecifier(specifier) || !specifier.imported) {
                return;
              }

              // Safety check for imported name
              if (
                !specifier.imported ||
                !specifier.imported.name ||
                typeof specifier.imported.name !== 'string'
              ) {
                return;
              }

              const apiMap = {
                // Components
                Link: 'Link',
                NavLink: 'NavLink',
                Form: 'Form',
                Outlet: 'Outlet',

                // Hooks
                // Map to useLocation for now
                useLoaderData: 'useLocation',
                useActionData: 'useNavigate',
                useSubmit: 'useNavigate',
                useTransition: 'useNavigation',
                useParams: 'useParams',

                // Functions
                redirect: 'redirect',
                json: 'json',
              };

              const importedName = specifier.imported.name;
              if (apiMap[importedName]) {
                specifier.imported.name = apiMap[importedName];
              }
            });
          }
        }
      },

      // Transform CommonJS requires
      CallExpression(path) {
        // Early return if node is missing
        if (!path.node || !path.node.callee) return;

        // Handle require calls
        if (
          t.isIdentifier(path.node.callee, {name: 'require'}) &&
          path.node.arguments &&
          path.node.arguments.length === 1 &&
          t.isStringLiteral(path.node.arguments[0])
        ) {
          const arg = path.node.arguments[0];
          if (!arg || !arg.value || typeof arg.value !== 'string') return;

          const source = arg.value;

          if (source.includes('@remix-run/')) {
            const packageMap = {
              '@remix-run/react': 'react-router-dom',
              '@remix-run/node': 'react-router',
              '@remix-run/server-runtime': 'react-router',
            };

            if (packageMap[source]) {
              path.node.arguments[0].value = packageMap[source];
            }
          }
          return;
        }

        // Handle function calls like redirect(), json()
        const callee = path.node.callee;

        // Handle member expressions like server_runtime_1.redirect
        if (t.isMemberExpression(callee) && callee.property) {
          const property = callee.property;
          if (
            t.isIdentifier(property) &&
            property.name &&
            typeof property.name === 'string'
          ) {
            const functionMap = {
              redirect: 'redirect',
              json: 'json',
            };

            if (functionMap[property.name]) {
              property.name = functionMap[property.name];
            }
          }
          return;
        }

        // Handle direct function calls
        if (
          t.isIdentifier(callee) &&
          callee.name &&
          typeof callee.name === 'string'
        ) {
          const functionMap = {
            redirect: 'redirect',
            json: 'json',
          };

          if (functionMap[callee.name]) {
            callee.name = functionMap[callee.name];
          }
        }
      },

      // Transform variable declarations with require
      VariableDeclarator(path) {
        if (
          !path.node ||
          !path.node.init ||
          !t.isCallExpression(path.node.init) ||
          !path.node.init.callee ||
          !t.isIdentifier(path.node.init.callee, {name: 'require'}) ||
          !path.node.init.arguments ||
          path.node.init.arguments.length !== 1 ||
          !t.isStringLiteral(path.node.init.arguments[0])
        ) {
          return;
        }

        const arg = path.node.init.arguments[0];
        if (!arg || !arg.value || typeof arg.value !== 'string') return;

        const source = arg.value;

        if (source.includes('@remix-run/')) {
          const packageMap = {
            '@remix-run/react': 'react-router-dom',
            '@remix-run/node': 'react-router',
            '@remix-run/server-runtime': 'react-router',
          };

          if (packageMap[source]) {
            path.node.init.arguments[0].value = packageMap[source];
          }
        }
      },

      // Handle JSX/component transformations
      JSXOpeningElement(path) {
        // We're still implementing this visitor
        // No operations for now
      },
    },
  };
}
