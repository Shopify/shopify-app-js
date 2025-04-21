/**
 * Babel plugin to safely transform Remix redirects to React Router
 */
export default function remixRedirectFix() {
  return {
    name: 'remix-redirect-fix',
    visitor: {
      ImportDeclaration(path) {
        const source = path.node.source.value;

        // Only process Remix imports
        if (
          source &&
          typeof source === 'string' &&
          source.includes('@remix-run/')
        ) {
          if (
            source === '@remix-run/server-runtime' ||
            source === '@remix-run/node'
          ) {
            // Change the import source to React Router
            path.node.source.value = 'react-router';

            // Find and handle the redirect import specifically
            path.node.specifiers = path.node.specifiers.map((specifier) => {
              if (
                specifier.type === 'ImportSpecifier' &&
                specifier.imported &&
                specifier.imported.name === 'redirect'
              ) {
                // Keep redirect import unchanged but from new source
                return specifier;
              }
              return specifier;
            });
          }
        }
      },

      // Don't try to transform any other references to avoid the charCodeAt issue
    },
  };
}