import path from 'node:path';

import {TSESLint} from '@typescript-eslint/utils';
import dedent from 'dedent';

import {rule} from '../rules/headers-export';

const ruleTester = new TSESLint.RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    projectService: {
      allowDefaultProject: ['src/__virtual__/*.js'],
      defaultProject: 'tsconfig.json',
    },
    tsconfigRootDir: path.join(__dirname, '../..'),
  },
});

console.info('Running headers export JavaScript test');

ruleTester.run('headers-export', rule, {
  valid: [
    {
      // Test case: File has authenticate.admin() call with proper headers export
      // Should: Pass without any errors
      code: `
        import {authenticate} from '../shopify.server';
        export const headers = (headersArgs) => {
          return boundary.headers(headersArgs);
        };
        export async function loader({request}) {
          await authenticate.admin(request);
          return null;
        }
      `,
      filename: 'src/__virtual__/test-file.js',
    },
    {
      // Test case: File has authenticate.public.pos() call with proper headers export
      // Should: Pass without any errors
      code: `
        import {authenticate} from '../shopify.server';
        export const headers = (headersArgs) => {
          return boundary.headers(headersArgs);
        };
        export async function loader({request}) {
          await authenticate.public.pos(request);
          return null;
        }
      `,
      filename: 'src/__virtual__/test-file.js',
    },
    {
      // Test case: File has authenticate.admin() call with custom headers implementation
      // Should: Pass as we only check for headers export existence, not its implementation
      code: `
        import {authenticate} from '../shopify.server';
        export const headers = () => {
          return new Headers({
            'Custom-Header': 'custom-value',
            'Another-Header': 'another-value',
          });
        };
        export async function loader({request}) {
          await authenticate.admin(request);
          return null;
        }
      `,
      filename: 'src/__virtual__/test-file.js',
    },
  ],
  invalid: [
    {
      // Test case: File has authenticate.admin() call but missing headers export
      // Should: Fail and auto-fix by adding the headers export
      code: dedent`
        import {authenticate} from '../shopify.server';
        export async function loader({request}) {
          await authenticate.admin(request);
          return null;
        }`,
      errors: [
        {
          messageId: 'missingHeadersExport',
        },
      ],
      output: dedent`
        import {authenticate} from '../shopify.server';
        import {boundary} from "@shopify/shopify-app-remix/server";
        export async function loader({request}) {
          await authenticate.admin(request);
          return null;
        }
        export const headers = (headersArgs) => {
          return boundary.headers(headersArgs);
        };`,
      filename: 'src/__virtual__/test-file.js',
    },
    {
      // Test case: File has authenticate.public.pos() call but missing headers export
      // Should: Fail and auto-fix by adding the headers export
      code: dedent`
        import {authenticate} from '../shopify.server';
        export async function loader({request}) {
          await authenticate.public.pos(request);
          return null;
        }`,
      errors: [
        {
          messageId: 'missingHeadersExport',
        },
      ],
      output: dedent`
        import {authenticate} from '../shopify.server';
        import {boundary} from "@shopify/shopify-app-remix/server";
        export async function loader({request}) {
          await authenticate.public.pos(request);
          return null;
        }
        export const headers = (headersArgs) => {
          return boundary.headers(headersArgs);
        };`,
      filename: 'src/__virtual__/test-file.js',
    },
    {
      // Test case: File has authenticate.admin() call but missing headers export, has correct imports
      // Should: Fail and auto-fix by adding the headers export
      code: dedent`
        import {authenticate} from '../shopify.server';
        import {boundary} from "@shopify/shopify-app-remix/server";
        export async function loader({request}) {
          await authenticate.admin(request);
          return null;
        }`,
      errors: [
        {
          messageId: 'missingHeadersExport',
        },
      ],
      output: dedent`
        import {authenticate} from '../shopify.server';
        import {boundary} from "@shopify/shopify-app-remix/server";
        export async function loader({request}) {
          await authenticate.admin(request);
          return null;
        }
        export const headers = (headersArgs) => {
          return boundary.headers(headersArgs);
        };`,
      filename: 'src/__virtual__/test-file.js',
    },
  ],
});
