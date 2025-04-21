/**
 * Simple Babel plugin that transforms Remix imports to React Router
 */
export default function remixToRouterImports() {
  return {
    name: 'remix-to-router-imports',
    visitor: {
      // Transform ES module imports
      ImportDeclaration(path) {
        if (!path.node?.source?.value) return;
        
        const source = path.node.source.value;
        if (typeof source !== 'string') return;

        // Map Remix packages to React Router packages
        const packageMap = {
          '@remix-run/react': 'react-router-dom',
          '@remix-run/node': 'react-router',
          '@remix-run/server-runtime': 'react-router',
        };
        
        // Handle JSX Runtime imports - these are causing problems
        if (
          source.includes('react/jsx-runtime') ||
          source.includes('react/jsx-dev-runtime')
        ) {
          path.node.source.value = source.replace(/^.*react\//, 'react/');
          return;
        }

        if (packageMap[source]) {
          path.node.source.value = packageMap[source];
        }
      },
      
      // Handle require calls in case they exist
      CallExpression(path) {
        const {node} = path;
        
        // Check if it's a require call
        if (
          node.callee?.name === 'require' &&
          node.arguments?.length === 1 &&
          node.arguments[0]?.type === 'StringLiteral'
        ) {
          const value = node.arguments[0].value;
          
          // Handle JSX Runtime requires
          if (
            value &&
            (value.includes('react/jsx-runtime') ||
              value.includes('react/jsx-dev-runtime'))
          ) {
            node.arguments[0].value = value.replace(/^.*react\//, 'react/');
            return;
          }
          
          // Only process Remix imports
          if (value?.includes('@remix-run/')) {
            const packageMap = {
              '@remix-run/react': 'react-router-dom',
              '@remix-run/node': 'react-router',
              '@remix-run/server-runtime': 'react-router',
            };

            if (packageMap[value]) {
              node.arguments[0].value = packageMap[value];
            }
          }
        }
      }
    }
  };
} 