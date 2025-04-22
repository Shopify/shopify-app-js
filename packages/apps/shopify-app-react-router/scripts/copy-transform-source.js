#!/usr/bin/env node
/* eslint-disable require-await */

const fs = require('fs');
const path = require('path');
const {promisify} = require('util');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

const REMIX_PACKAGE_PATH = path.resolve(
  __dirname,
  '../../shopify-app-remix/src',
);
const REACT_ROUTER_PACKAGE_PATH = path.resolve(__dirname, '../src');

// Map of Remix packages to React Router packages
const packageMappings = {
  '@remix-run/node': 'react-router',
  '@remix-run/react': 'react-router',
  '@remix-run/server-runtime': 'react-router',
  '@remix-run/testing': 'react-router',
};

// Components that need to be renamed
const componentMappings = {
  RemixServer: 'ServerRouter',
  RemixBrowser: 'HydratedRouter',
  useLoaderData: 'useRouteLoaderData',
  useRouteLoaderData: 'useRouteLoaderData',
  useSubmit: 'useSubmit',
  useActionData: 'useActionResult',
  useTransition: 'useNavigation',
  Form: 'Form',
  Link: 'Link',
  NavLink: 'NavLink',
  Outlet: 'Outlet',
  Scripts: 'Scripts',
  ScrollRestoration: 'ScrollRestoration',
  // Add more component mappings as needed
};

// Function mappings
const functionMappings = {
  json: 'json',
  redirect: 'redirect',
  isRouteErrorResponse: 'isRouteErrorResponse',
  // Adding more function mappings from @remix-run/node that should come from react-router
  createCookie: 'createCookie',
  createCookieSessionStorage: 'createCookieSessionStorage',
  createMemorySessionStorage: 'createMemorySessionStorage',
  createSessionStorage: 'createSessionStorage',
};

async function ensureDirectoryExists(dirPath) {
  try {
    await mkdir(dirPath, {recursive: true});
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
}

async function transformContent(content) {
  let transformedContent = content;
  let hasTypedResponseType = false;

  // Replace package imports
  Object.entries(packageMappings).forEach(([from, to]) => {
    const regexPattern = new RegExp(`from ['"]${from}['"]`, 'g');
    transformedContent = transformedContent.replace(
      regexPattern,
      `from '${to}'`,
    );
  });

  // Special case for TypedResponse from @remix-run/server-runtime
  const typedResponseRegex =
    /import\s*{([^}]*)TypedResponse([^}]*)}\s*from\s*['"]@remix-run\/server-runtime['"]/g;
  transformedContent = transformedContent.replace(
    typedResponseRegex,
    (match, before, after) => {
      // Instead of importing TypedResponse, add a type definition
      hasTypedResponseType = true;

      // Clean up the remaining import statement to avoid dangling commas
      const cleanedBefore = before.replace(/,\s*$/, '');
      const cleanedAfter = after.replace(/^\s*,/, '');

      // If both are empty or just whitespace, remove the entire import
      if (!cleanedBefore.trim() && !cleanedAfter.trim()) {
        return `// Custom TypedResponse definition since it's not available in react-router
type TypedResponse<T = unknown> = Omit<Response, "json"> & {
  json(): Promise<T>;
};`;
      }

      return `// Custom TypedResponse definition since it's not available in react-router
type TypedResponse<T = unknown> = Omit<Response, "json"> & {
  json(): Promise<T>;
};

import {${cleanedBefore}${cleanedAfter ? (cleanedBefore.trim() ? ', ' : '') + cleanedAfter : ''}} from 'react-router'`;
    },
  );

  // Also handle any TypedResponse import from react-router directly
  const reactRouterTypeResponseRegex =
    /import\s*{([^}]*)TypedResponse([^}]*)}\s*from\s*['"]react-router['"]/g;
  transformedContent = transformedContent.replace(
    reactRouterTypeResponseRegex,
    (match, before, after) => {
      // Instead of importing TypedResponse, add a type definition
      hasTypedResponseType = true;

      // Clean up the remaining import statement to avoid dangling commas
      const cleanedBefore = before.replace(/,\s*$/, '');
      const cleanedAfter = after.replace(/^\s*,/, '');

      // If both are empty or just whitespace, remove the entire import
      if (!cleanedBefore.trim() && !cleanedAfter.trim()) {
        return `// Custom TypedResponse definition since it's not available in react-router
type TypedResponse<T = unknown> = Omit<Response, "json"> & {
  json(): Promise<T>;
};`;
      }

      return `// Custom TypedResponse definition since it's not available in react-router
type TypedResponse<T = unknown> = Omit<Response, "json"> & {
  json(): Promise<T>;
};

import {${cleanedBefore}${cleanedAfter ? (cleanedBefore.trim() ? ', ' : '') + cleanedAfter : ''}} from 'react-router'`;
    },
  );

  // Check if the file uses TypedResponse but doesn't have the definition
  if (!hasTypedResponseType && content.includes('TypedResponse')) {
    // Add the type definition at the beginning of the file, after any imports
    const importsEndIndex = content.lastIndexOf('import ');
    if (importsEndIndex > -1) {
      // Find the end of the last import statement
      const endOfImports = content.indexOf('\n', importsEndIndex);
      if (endOfImports > -1) {
        transformedContent = `${transformedContent.substring(0, endOfImports + 1)}
// Custom TypedResponse definition since it's not available in react-router
type TypedResponse<T = unknown> = Omit<Response, "json"> & {
  json(): Promise<T>;
};
${transformedContent.substring(endOfImports + 1)}`;
        hasTypedResponseType = true;
      }
    }
  }

  // Special case for redirect and other functions from @remix-run/node
  const nodeImportRegex =
    /import\s*{([^}]*)}\s*from\s*['"]@remix-run\/node['"]/g;
  transformedContent = transformedContent.replace(
    nodeImportRegex,
    (match, imports) => {
      // Filter out installGlobals
      if (imports.includes('installGlobals')) {
        const filteredImports = imports
          .split(',')
          .map((item) => item.trim())
          .filter((item) => !item.includes('installGlobals'))
          .join(', ');

        if (filteredImports) {
          return `import {${filteredImports}} from 'react-router'`;
        } else {
          // If installGlobals was the only import, remove the entire import statement
          return '';
        }
      }

      // All other imports from @remix-run/node should now come from react-router
      return `import {${imports}} from 'react-router'`;
    },
  );

  // Also handle any installGlobals imports from react-router directly
  const reactRouterImportRegex =
    /import\s*{([^}]*)}\s*from\s*['"]react-router['"]/g;
  transformedContent = transformedContent.replace(
    reactRouterImportRegex,
    (match, imports) => {
      // Filter out installGlobals
      if (imports.includes('installGlobals')) {
        const filteredImports = imports
          .split(',')
          .map((item) => item.trim())
          .filter((item) => !item.includes('installGlobals'))
          .join(', ');

        if (filteredImports) {
          return `import {${filteredImports}} from 'react-router'`;
        } else {
          // If installGlobals was the only import, remove the entire import statement
          return '';
        }
      }

      return match;
    },
  );

  // Remove any installGlobals() function calls
  transformedContent = transformedContent.replace(/installGlobals\(\);?/g, '');

  // Replace @react-router/node with react-router in example code or comments
  transformedContent = transformedContent.replace(
    /@react-router\/node/g,
    'react-router',
  );

  // Replace component names
  Object.entries(componentMappings).forEach(([from, to]) => {
    // Handle import { RemixServer } pattern
    const importRegex = new RegExp(
      `import\\s*{([^}]*)${from}([^}]*)}\\s*from`,
      'g',
    );
    transformedContent = transformedContent.replace(
      importRegex,
      (match, before, after) => {
        return `import {${before}${to}${after}} from`;
      },
    );

    // Handle component usage elsewhere
    const usageRegex = new RegExp(`\\b${from}\\b(?!['"])`, 'g');
    transformedContent = transformedContent.replace(usageRegex, to);
  });

  // Replace function names
  Object.entries(functionMappings).forEach(([from, to]) => {
    // Only replace where it's clearly a function call but not within strings
    const funcRegex = new RegExp(`\\b${from}\\s*\\(`, 'g');
    transformedContent = transformedContent.replace(funcRegex, `${to}(`);
  });

  // Add type assertion for remixRedirect to TypedResponse<never>
  transformedContent = transformedContent.replace(
    /return\s+remixRedirect\s*\((.*?)\)\s*;/g,
    'return remixRedirect($1) as TypedResponse<never>;'
  );

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
    } else if (
      entryStats.isFile() &&
      (sourcePath.endsWith('.ts') || sourcePath.endsWith('.tsx'))
    ) {
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
    if (!fs.existsSync(REMIX_PACKAGE_PATH)) {
      console.error(`Source package not found at: ${REMIX_PACKAGE_PATH}`);
      process.exit(1);
    }

    await copyAndTransformDirectory(
      REMIX_PACKAGE_PATH,
      REACT_ROUTER_PACKAGE_PATH,
    );
    console.log('Source transformation complete!');
  } catch (error) {
    console.error('Error during source transformation:', error);
    process.exit(1);
  }
}

main();
