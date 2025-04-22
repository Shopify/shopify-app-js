# shopify-app-react-router Implementation Plan

This document outlines the implementation plan for creating a `shopify-app-react-router` package that's compatible with React Router v7, derived from the existing `shopify-app-remix` package.

## Overview

The goal is to create a drop-in replacement for `shopify-app-remix` that works with React Router v7 instead of Remix. This involves:

1. Creating a new package structure
2. Transforming source code from the existing package
3. Replacing Remix imports with React Router v7 imports
4. Setting up a build process

## 1. Package Setup

```bash
mkdir -p packages/apps/shopify-app-react-router/src
cd packages/apps/shopify-app-react-router
```

Create a minimal package.json:

```json
{
  "name": "@shopify/shopify-app-react-router",
  "version": "1.0.0",
  "description": "Shopify React Router - to simplify the building of Shopify Apps with React Router v7",
  "main": "./dist/cjs/server/index.js",
  "module": "./dist/esm/server/index.mjs",
  "types": "./dist/ts/server/index.d.ts",
  "exports": {
    "./adapters/*": {
      "types": "./dist/ts/server/adapters/*/index.d.ts",
      "require": "./dist/cjs/server/adapters/*/index.js",
      "import": "./dist/esm/server/adapters/*/index.mjs"
    },
    "./server/adapters/*": {
      "types": "./dist/ts/server/adapters/*/index.d.ts",
      "require": "./dist/cjs/server/adapters/*/index.js",
      "import": "./dist/esm/server/adapters/*/index.mjs"
    },
    "./server": {
      "types": "./dist/ts/server/index.d.ts",
      "require": "./dist/cjs/server/index.js",
      "import": "./dist/esm/server/index.mjs"
    },
    "./react": {
      "types": "./dist/ts/react/index.d.ts",
      "require": "./dist/cjs/react/index.js",
      "import": "./dist/esm/react/index.mjs"
    },
    "./test-helpers": {
      "types": "./dist/ts/server/test-helpers/index.d.ts",
      "require": "./dist/cjs/server/test-helpers/index.js",
      "import": "./dist/esm/server/test-helpers/index.mjs"
    }
  },
  "scripts": {
    "build": "node scripts/build.js",
    "clean": "rimraf dist src",
    "copy-transform": "node scripts/copy-transform-source.js",
    "rollup": "rollup -c rollup.config.js --bundleConfigAsCjs",
    "tsc": "tsc -p ./tsconfig.build.json"
  },
  "dependencies": {
    "react-router": "^7.0.0",
    "@react-router/node": "^7.0.0",
    "@shopify/admin-api-client": "^1.0.8",
    "@shopify/shopify-api": "^11.12.0",
    "@shopify/shopify-app-session-storage": "^3.0.17",
    "@shopify/storefront-api-client": "^1.0.7",
    "isbot": "^5.1.26",
    "semver": "^7.7.1"
  },
  "peerDependencies": {
    "react-router": "^7.0.0",
    "react-router-dom": "^7.0.0",
    "@react-router/node": "^7.0.0",
    "@shopify/polaris": "*",
    "react": "*"
  },
  "files": [
    "dist/*"
  ]
}
```

## 2. Source Transformation Script

Create a script to copy and transform source code from `shopify-app-remix`:

```javascript
// scripts/copy-transform-source.js
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

const REMIX_PACKAGE_PATH = path.resolve(__dirname, '../../shopify-app-remix/src');
const REACT_ROUTER_PACKAGE_PATH = path.resolve(__dirname, '../src');

// Map of Remix packages to React Router packages
const packageMappings = {
  '@remix-run/node': '@react-router/node',
  '@remix-run/react': 'react-router',
  '@remix-run/server-runtime': 'react-router',
  '@remix-run/testing': 'react-router',
};

// Components that need to be renamed
const componentMappings = {
  'RemixServer': 'ServerRouter',
  'RemixBrowser': 'HydratedRouter',
};

async function ensureDirectoryExists(dirPath) {
  try {
    await mkdir(dirPath, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
}

async function transformContent(content) {
  let transformedContent = content;
  
  // Replace package imports
  Object.entries(packageMappings).forEach(([from, to]) => {
    const regexPattern = new RegExp(`from ['"]${from}['"]`, 'g');
    transformedContent = transformedContent.replace(regexPattern, `from '${to}'`);
  });
  
  // Replace component names
  Object.entries(componentMappings).forEach(([from, to]) => {
    // Handle import { RemixServer } pattern
    const importRegex = new RegExp(`import\\s*{([^}]*)${from}([^}]*)}\\s*from`, 'g');
    transformedContent = transformedContent.replace(importRegex, (match, before, after) => {
      return `import {${before}${to}${after}} from`;
    });
    
    // Handle component usage elsewhere
    const usageRegex = new RegExp(`\\b${from}\\b(?!['"])`, 'g');
    transformedContent = transformedContent.replace(usageRegex, to);
  });
  
  return transformedContent;
}

async function copyAndTransformDirectory(source, target) {
  await ensureDirectoryExists(target);
  
  const entries = await readdir(source);
  
  for (const entry of entries) {
    const sourcePath = path.join(source, entry);
    const targetPath = path.join(target, entry);
    
    const entryStats = await stat(sourcePath);
    
    if (entryStats.isDirectory()) {
      await copyAndTransformDirectory(sourcePath, targetPath);
    } else if (entryStats.isFile() && (sourcePath.endsWith('.ts') || sourcePath.endsWith('.tsx'))) {
      const content = await readFile(sourcePath, 'utf8');
      const transformedContent = await transformContent(content);
      
      await ensureDirectoryExists(path.dirname(targetPath));
      await writeFile(targetPath, transformedContent);
      
      console.log(`Transformed: ${sourcePath} -> ${targetPath}`);
    } else if (entryStats.isFile()) {
      // Just copy non-TS files
      await ensureDirectoryExists(path.dirname(targetPath));
      fs.copyFileSync(sourcePath, targetPath);
      
      console.log(`Copied: ${sourcePath} -> ${targetPath}`);
    }
  }
}

async function main() {
  try {
    await copyAndTransformDirectory(REMIX_PACKAGE_PATH, REACT_ROUTER_PACKAGE_PATH);
    console.log('Source transformation complete!');
  } catch (error) {
    console.error('Error during source transformation:', error);
    process.exit(1);
  }
}

main();
```

## 3. Rollup Configuration

Create a rollup config to build the package:

```javascript
// rollup.config.js
import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import fs from 'fs';
import path from 'path';

// Get all adapter directories
const adapterDirs = fs.readdirSync(path.resolve(__dirname, 'src/server/adapters'))
  .filter(dir => fs.statSync(path.resolve(__dirname, 'src/server/adapters', dir)).isDirectory());

const createConfig = (format) => {
  const extension = format === 'cjs' ? '.js' : '.mjs';
  const outputDir = `dist/${format}`;
  
  const configs = [
    // Server bundle
    {
      input: 'src/server/index.ts',
      output: {
        file: `${outputDir}/server/index${extension}`,
        format,
        sourcemap: true,
      },
      external: [
        'react', 
        'react-dom',
        'react-router',
        'react-router-dom',
        '@react-router/node',
        '@shopify/shopify-api',
        '@shopify/admin-api-client',
        '@shopify/storefront-api-client',
        '@shopify/shopify-app-session-storage',
      ],
      plugins: [
        replace({
          preventAssignment: true,
          // Any additional replacements that might be needed during build time
          // This is a fallback in case the source transformation missed something
        }),
        nodeResolve(),
        commonjs(),
        typescript({
          tsconfig: './tsconfig.build.json',
          outputToFilesystem: true,
        }),
      ]
    },
    
    // React bundle
    {
      input: 'src/react/index.ts',
      output: {
        file: `${outputDir}/react/index${extension}`,
        format,
        sourcemap: true,
      },
      external: [
        'react', 
        'react-dom',
        'react-router',
        'react-router-dom',
        '@react-router/node',
        '@shopify/shopify-api',
        '@shopify/polaris',
      ],
      plugins: [
        replace({
          preventAssignment: true,
        }),
        nodeResolve(),
        commonjs(),
        typescript({
          tsconfig: './tsconfig.build.json',
          outputToFilesystem: true,
        }),
      ]
    },
    
    // Test helpers bundle
    {
      input: 'src/server/test-helpers/index.ts',
      output: {
        file: `${outputDir}/server/test-helpers/index${extension}`,
        format,
        sourcemap: true,
      },
      external: [
        'react', 
        'react-dom',
        'react-router',
        'react-router-dom',
        '@react-router/node',
        '@shopify/shopify-api',
      ],
      plugins: [
        replace({
          preventAssignment: true,
        }),
        nodeResolve(),
        commonjs(),
        typescript({
          tsconfig: './tsconfig.build.json',
          outputToFilesystem: true,
        }),
      ]
    },
    
    // Adapter bundles - one for each adapter directory
    ...adapterDirs.map(adapter => ({
      input: `src/server/adapters/${adapter}/index.ts`,
      output: {
        file: `${outputDir}/server/adapters/${adapter}/index${extension}`,
        format,
        sourcemap: true,
      },
      external: [
        'react', 
        'react-dom',
        'react-router',
        'react-router-dom',
        '@react-router/node',
        '@shopify/shopify-api',
      ],
      plugins: [
        replace({
          preventAssignment: true,
        }),
        nodeResolve(),
        commonjs(),
        typescript({
          tsconfig: './tsconfig.build.json',
          outputToFilesystem: true,
        }),
      ]
    }))
  ];
  
  return configs;
};

export default defineConfig([
  ...createConfig('cjs'),
  ...createConfig('esm')
]);
```

## 4. TypeScript Configuration

Create a TypeScript configuration:

```json
// tsconfig.build.json
{
  "compilerOptions": {
    "target": "ES2019",
    "lib": ["DOM", "DOM.Iterable", "ES2019"],
    "module": "ESNext",
    "moduleResolution": "node",
    "outDir": "dist/ts",
    "declaration": true,
    "emitDeclarationOnly": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "resolveJsonModule": true,
    "jsx": "react-jsx",
    "strict": true,
    "paths": {
      "@remix-run/node": ["./node_modules/@react-router/node"],
      "@remix-run/react": ["./node_modules/react-router"],
      "@remix-run/server-runtime": ["./node_modules/react-router"],
      "@remix-run/testing": ["./node_modules/react-router"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["**/*.test.ts", "**/*.test.tsx", "**/tests/**/*"]
}
```

## 5. Main Build Script

Create a main build script:

```javascript
// scripts/build.js
const { execSync } = require('child_process');
const path = require('path');

// Define paths
const PROJECT_ROOT = path.resolve(__dirname, '..');

// Execute commands
function exec(command, cwd = PROJECT_ROOT) {
  console.log(`Executing: ${command}`);
  execSync(command, { cwd, stdio: 'inherit' });
}

// Main build process
async function build() {
  try {
    // 1. Clean the dist and src directories
    exec('pnpm clean');
    
    // 2. Copy and transform source from Remix to React Router
    exec('pnpm copy-transform');
    
    // 3. Build with rollup
    exec('pnpm rollup');
    
    // 4. Generate type declarations
    exec('pnpm tsc');
    
    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();
```

## Implementation Steps

1. **Setup the structure**
   - Create the directory for the new package
   - Create the package.json file
   - Create the scripts directory

2. **Create the transformation and build scripts**
   - copy-transform-source.js
   - build.js
   - rollup.config.js
   - tsconfig.build.json

3. **Run the build process**
   ```bash
   cd packages/apps/shopify-app-react-router
   pnpm install
   pnpm build
   ```

4. **Validate the output**
   - Make sure the directory structure matches shopify-app-remix
   - Ensure all Remix imports are replaced with React Router v7 imports
   - Test with a simple application

## Key Transformation Points

The main transformations that occur:

1. **Package imports**
   - `@remix-run/node` -> `@react-router/node`
   - `@remix-run/react` -> `react-router`
   - `@remix-run/server-runtime` -> `react-router`
   - `@remix-run/testing` -> `react-router`

2. **Component names**
   - `RemixServer` -> `ServerRouter`
   - `RemixBrowser` -> `HydratedRouter`

3. **Directory structure and exports**
   - Maintains the same directory structure and exports as shopify-app-remix
   - Preserves the same API interface for backwards compatibility 