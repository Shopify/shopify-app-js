# Converting shopify-app-remix to React Router

This guide walks through creating a build pipeline that transforms the shopify-app-remix package into a React Router equivalent.

## Overview

We'll use Rollup with a custom Babel plugin to:
1. Read from the shopify-app-remix source code
2. Transform all Remix API references to React Router equivalents
3. Output a new package with the same structure but React Router dependencies

## Prerequisites

- Node.js and npm/pnpm
- Access to shopify-app-remix source code
- Basic knowledge of Babel and Rollup

## Implementation Steps

### 1. Set Up Project Structure

```bash
mkdir -p packages/apps/shopify-app-router
```

### 2. Create Babel Transformation Plugin

Create `babel-plugin-remix-to-router.js`:

```javascript
module.exports = function({ types: t }) {
  return {
    name: 'remix-to-react-router',
    visitor: {
      // Transform imports from Remix to React Router
      ImportDeclaration(path) {
        const source = path.node.source.value;
        
        // Remap package imports
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
          path.node.specifiers.forEach(specifier => {
            if (t.isImportSpecifier(specifier) && specifier.imported) {
              const apiMap = {
                // Components
                'Link': 'Link',
                'NavLink': 'NavLink',
                'Form': 'Form',
                'Outlet': 'Outlet',
                
                // Hooks
                'useLoaderData': 'useLoaderData', // Custom implementation 
                'useActionData': 'useNavigate',
                'useSubmit': 'useNavigate',
                'useTransition': 'useNavigation',
                'useParams': 'useParams',
                
                // Add other mappings
              };
              
              const importedName = specifier.imported.name;
              if (apiMap[importedName]) {
                specifier.imported.name = apiMap[importedName];
              }
            }
          });
        }
      },
      
      // Transform function calls and JSX components
      CallExpression(path) {
        const callee = path.node.callee;
        if (t.isIdentifier(callee)) {
          // Remap function calls
          const functionMap = {
            'json': 'json', // May need custom implementation
            'redirect': 'redirect',
          };
          
          if (functionMap[callee.name]) {
            callee.name = functionMap[callee.name];
          }
        }
      },
      
      // Handle JSX/component transformations
      JSXOpeningElement(path) {
        // Transform component props and behavior differences
      }
    }
  };
};
```

### 3. Create Package Configuration

Create `packages/apps/shopify-app-router/package.json`:

```json
{
  "name": "@shopify/shopify-app-router",
  "version": "1.0.0",
  "description": "React Router version of shopify-app-remix",
  "main": "dist/index.js",
  "types": "dist/types/index.d.ts",
  "files": [
    "dist"
  ],
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "react-router": "^6.4.0",
    "react-router-dom": "^6.4.0"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

### 4. Create Compatibility Layer

Create `packages/apps/shopify-app-router/src/compatibility.ts`:

```typescript
import { useLocation, useNavigate } from 'react-router-dom';

// Custom implementation of Remix's useLoaderData
export function useLoaderData() {
  const location = useLocation();
  return location.state?.loaderData || {};
}

// Custom implementation of json function
export function json(data, options = {}) {
  return data;
}

// Add other compatibility functions as needed
```

### 5. Configure Rollup Build

Create `rollup.config.router.js`:

```javascript
import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import path from 'path';
import fs from 'fs';

const REMIX_PACKAGE_PATH = path.resolve('packages/apps/shopify-app-remix');
const ROUTER_PACKAGE_PATH = path.resolve('packages/apps/shopify-app-router');

// Get source entry points
function getEntryPoints() {
  const srcPath = path.join(REMIX_PACKAGE_PATH, 'src');
  const entries = {
    'index': path.join(srcPath, 'index.ts')
  };
  
  // Add any submodule entry points
  if (fs.existsSync(path.join(srcPath, 'server'))) {
    entries['server'] = path.join(srcPath, 'server/index.ts');
  }
  
  return entries;
}

export default {
  input: getEntryPoints(),
  
  output: {
    dir: path.join(ROUTER_PACKAGE_PATH, 'dist'),
    format: 'esm',
    preserveModules: true,
    preserveModulesRoot: 'src'
  },
  
  external: [
    'react',
    'react-dom',
    'react-router',
    'react-router-dom',
    // Add other externals
  ],
  
  plugins: [
    // Handle TypeScript
    typescript({
      tsconfig: path.join(REMIX_PACKAGE_PATH, 'tsconfig.json'),
      declaration: true,
      declarationDir: path.join(ROUTER_PACKAGE_PATH, 'dist/types'),
      rootDir: path.join(REMIX_PACKAGE_PATH, 'src')
    }),
    
    // Apply Babel transformation
    babel({
      babelHelpers: 'bundled',
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      plugins: [
        // Our custom transformation plugin
        path.resolve('./babel-plugin-remix-to-router.js')
      ],
      babelrc: false,
      configFile: false
    }),
    
    resolve(),
    commonjs()
  ]
};
```

### 6. Add Build Script to Root package.json

Add this to your root package.json:

```json
{
  "scripts": {
    "build:router": "rollup -c rollup.config.router.js"
  }
}
```

### 7. Install Dependencies

```bash
pnpm add -D rollup @rollup/plugin-babel @rollup/plugin-node-resolve @rollup/plugin-commonjs @rollup/plugin-typescript @babel/core
```

### 8. Copy Any Static Files

Copy README, LICENSE, and other static files:

```bash
cp packages/apps/shopify-app-remix/README.md packages/apps/shopify-app-router/
cp packages/apps/shopify-app-remix/LICENSE packages/apps/shopify-app-router/
```

### 9. Build the New Package

```bash
pnpm run build:router
```

## Advanced Customization

### Handling API Differences

Many Remix APIs don't have direct equivalents in React Router. For these cases:

1. Create adapter functions in the compatibility layer
2. Modify the Babel plugin to import from your compatibility layer

### Adding Custom Polyfills

For Remix features without React Router equivalents:

```javascript
// In babel-plugin-remix-to-router.js
// When finding an import like: import { useLoaderData } from '@remix-run/react'
// Transform to: import { useLoaderData } from './compatibility'

if (apiNeedsPolyfill[importedName]) {
  // Replace with custom compatibility import
  specifier.imported.name = importedName;
  path.node.source.value = './compatibility';
}
```

## Testing

1. Create a test app using the original Remix package
2. Build the React Router version
3. Create an identical test app using the new package
4. Compare behavior and fix discrepancies

## Troubleshooting

- **Missing transformations**: Update the Babel plugin with additional mappings
- **Runtime errors**: Add polyfills to the compatibility layer
- **Build failures**: Check that all file paths and entry points are correct

## Conclusion

This approach allows you to maintain two parallel packages with minimal manual intervention. As Remix and React Router evolve, update the transformation rules to maintain compatibility. 