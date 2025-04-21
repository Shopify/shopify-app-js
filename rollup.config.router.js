import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import path from 'path';
import fs from 'fs';

// Custom plugin to fix React imports after bundling
function fixReactImports() {
  return {
    name: 'fix-react-imports',
    generateBundle(outputOptions, bundle) {
      // Process each chunk
      Object.keys(bundle).forEach(id => {
        const chunk = bundle[id];
        
        // Only process actual code chunks
        if (chunk.type === 'chunk') {
          // Replace problematic path patterns
          if (chunk.code) {
            // Fix node_modules/react paths
            chunk.code = chunk.code.replace(
              /from\s+['"](.+?)\/node_modules\/react(\/[^'"]+)?['"]/g, 
              'from "react$2"'
            );
            
            // Fix JSX runtime paths with multiple patterns
            chunk.code = chunk.code.replace(
              /from\s+['"](.+?)\/jsx-runtime['"]/g,
              'from "react/jsx-runtime"'
            );
            
            // Fix JSX runtime paths with node_modules
            chunk.code = chunk.code.replace(
              /from\s+['"](.+?)node_modules.*\/react\/jsx-runtime['"]/g,
              'from "react/jsx-runtime"'
            );
            
            // Fix ESM import paths with .js extensions for react
            chunk.code = chunk.code.replace(
              /from\s+['"](react(?:\/[^.'"]+)?)\.js['"]/g, 
              'from "$1"'
            );
            
            // Fix deep imports to react
            chunk.code = chunk.code.replace(
              /from\s+['"](\.\.\/)+node_modules\/react(\/[^'"]+)?['"]/g,
              'from "react$2"'
            );
            
            // Fix direct imports from node_modules
            chunk.code = chunk.code.replace(
              /from\s+['"]node_modules\/react(\/[^'"]+)?['"]/g,
              'from "react$1"'
            );
            
            // Fix require paths
            chunk.code = chunk.code.replace(
              /require\(['"](.+?)\/node_modules\/react(\/[^'"]+)?['"]\)/g,
              'require("react$2")'
            );
          }
        }
      });
    }
  };
}

const REMIX_PACKAGE_PATH = path.resolve('packages/apps/shopify-app-remix');
const ROUTER_PACKAGE_PATH = path.resolve('packages/apps/shopify-app-router');

// Get source entry points - recursively find all TypeScript files
function getEntryPoints() {
  const entries = {};
  const srcPath = path.join(REMIX_PACKAGE_PATH, 'src');
  
  function processDirectory(dir, relativePath = '') {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      const entryPath = relativePath ? path.join(relativePath, file.name) : file.name;
      
      if (file.isDirectory()) {
        processDirectory(fullPath, entryPath);
      } else if (file.name.endsWith('.ts') || file.name.endsWith('.tsx')) {
        // Skip test files, declaration files, and test helpers
        if (!file.name.includes('.test.') && 
            !file.name.includes('.spec.') && 
            !file.name.endsWith('.d.ts') &&
            !entryPath.includes('__test-helpers') &&
            !entryPath.includes('.doc.example') &&
            !entryPath.includes('__tests__')) {
          // Create entry point without extension
          const entryKey = entryPath.replace(/\.(ts|tsx)$/, '');
          entries[entryKey] = fullPath;
        }
      }
    }
  }
  
  // Process server and react directories
  if (fs.existsSync(path.join(srcPath, 'server'))) {
    processDirectory(path.join(srcPath, 'server'), 'server');
  }
  
  if (fs.existsSync(path.join(srcPath, 'react'))) {
    processDirectory(path.join(srcPath, 'react'), 'react');
  }
  
  return entries;
}

// External packages that should not be bundled
const external = [
  'react',
  'react-dom',
  'react-router',
  'react-router-dom',
  '@shopify/shopify-api',
  '@shopify/admin-api-client',
  '@shopify/storefront-api-client',
  '@shopify/shopify-app-session-storage',
  '@shopify/polaris',
  '@remix-run/node',
  '@remix-run/react',
  '@remix-run/server-runtime',
  'isbot',
  'semver',
  'crypto',
  'path',
  'fs',
  'url',
  'stream',
  'events',
  'http',
  'https',
  'zlib',
  'util',
  'buffer',
  'querystring',
  'node:*',
];

// Common plugin array used for both ESM and CJS builds
const createPlugins = (format) => [
  // Handle JSON imports
  json(),
  
  // Apply Babel transformations
  babel({
    babelHelpers: 'bundled',
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    plugins: [
      // Only plugin is to replace Remix imports with React Router
      './babel-plugin-remix-imports.js',
    ],
    presets: [
      ['@babel/preset-env', { 
        targets: { node: 18 },
        modules: false // Always keep ES modules intact for Rollup
      }],
      '@babel/preset-typescript',
      '@babel/preset-react'
    ],
    babelrc: false,
    configFile: false
  }),
  
  // Resolve dependencies
  resolve({
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
    preferBuiltins: true,
    // Don't create nested node_modules
    moduleDirectories: ['node_modules'],
    // Don't bundle node_modules
    resolveOnly: [
      // Only resolve files inside the project, not from node_modules
      (module) => !module.includes('node_modules')
    ],
    // Important to prevent symlink issues with pnpm
    preserveSymlinks: true
  }),
  
  // Convert CommonJS modules to ES modules
  commonjs({
    // Settings for better ESM output
    transformMixedEsModules: true,
    requireReturnsDefault: 'preferred',
    // Don't process global variables
    ignoreGlobal: true
  }),
  
  // Apply the custom path fix plugin
  fixReactImports()
];

// TypeScript config path
const tsconfigPath = path.join(REMIX_PACKAGE_PATH, 'tsconfig.json');

// Create ESM and CJS configurations
export default [
  // ESM build
  {
    input: getEntryPoints(),
    output: {
      dir: path.join(ROUTER_PACKAGE_PATH, 'dist/esm'),
      format: 'esm',
      entryFileNames: '[name].mjs',
      preserveModules: true,
      preserveModulesRoot: 'src',
      sourcemap: true,
      // Properly map external dependencies to their correct paths
      paths: id => {
        // Fix imports for React and other external modules
        if (external.some(ext => id === ext || id.startsWith(`${ext}/`))) {
          return id; // Return bare module specifier for external deps
        }
        return id;
      },
      // Ensure proper handling of dependencies
      manualChunks(id) {
        // Force React and JSX runtime to be treated as external
        if (id.includes('node_modules/react') || id.includes('jsx-runtime')) {
          return 'vendor/react';
        }
        return null;
      }
    },
    external,
    plugins: [
      // Handle TypeScript
      typescript({
        tsconfig: tsconfigPath,
        declaration: false, // Only in declaration build
        rootDir: path.join(REMIX_PACKAGE_PATH, 'src'),
        module: 'ESNext', // Use ESNext for ESM output
        target: 'es2019',
        moduleResolution: 'node',
        outDir: path.join(ROUTER_PACKAGE_PATH, 'dist/esm'),
        noEmit: false,
        composite: false
      }),
      ...createPlugins('esm')
    ]
  },
  
  // CJS build
  {
    input: getEntryPoints(),
    output: {
      dir: path.join(ROUTER_PACKAGE_PATH, 'dist/cjs'),
      format: 'cjs',
      entryFileNames: '[name].js',
      preserveModules: true,
      preserveModulesRoot: 'src',
      sourcemap: true,
      // Properly map external dependencies to their correct paths
      paths: id => {
        // Fix imports for React and other external modules
        if (external.some(ext => id === ext || id.startsWith(`${ext}/`))) {
          return id; // Return bare module specifier for external deps
        }
        return id;
      },
      // Ensure proper handling of dependencies
      manualChunks(id) {
        // Force React and JSX runtime to be treated as external
        if (id.includes('node_modules/react') || id.includes('jsx-runtime')) {
          return 'vendor/react';
        }
        return null;
      }
    },
    external,
    plugins: [
      // Handle TypeScript
      typescript({
        tsconfig: tsconfigPath,
        declaration: false,
        rootDir: path.join(REMIX_PACKAGE_PATH, 'src'),
        module: 'CommonJS',
        target: 'es2019',
        moduleResolution: 'node',
        outDir: path.join(ROUTER_PACKAGE_PATH, 'dist/cjs'),
        noEmit: false,
        composite: false
      }),
      ...createPlugins('cjs')
    ]
  },
  
  // Declaration build (TS only)
  {
    input: getEntryPoints(),
    output: {
      dir: path.join(ROUTER_PACKAGE_PATH, 'dist/ts'),
      format: 'esm',
      preserveModules: true,
      preserveModulesRoot: 'src'
    },
    external,
    plugins: [
      typescript({
        tsconfig: tsconfigPath,
        declaration: true,
        emitDeclarationOnly: true,
        rootDir: path.join(REMIX_PACKAGE_PATH, 'src'),
        outDir: path.join(ROUTER_PACKAGE_PATH, 'dist/ts'),
        noEmit: false,
        composite: false
      })
    ]
  }
]; 