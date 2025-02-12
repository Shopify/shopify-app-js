import {RuleTester} from 'eslint';
import * as parser from '@typescript-eslint/parser';
// eslint-disable-next-line import/extensions
import shopifyAppRule from './index.js';

const ruleTester = new RuleTester({
  parser,
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      modules: true,
    },
    project: null,
    tsconfigRootDir: null,
  },
});

// Register the rule directly
ruleTester.defineRule('shopify-app-headers', shopifyAppRule);

ruleTester.run('shopify-app-headers', shopifyAppRule, {
  valid: [
    {
      // Test case: File has authenticate.admin() call with proper headers export
      // Should: Pass without any errors
      code: `
          import {authenticate} from '../shopify.server';
          import {boundary} from "@shopify/shopify-app-remix/server";
          
          export const headers = (headersArgs) => {
            return boundary.headers(headersArgs);
          };

          export async function loader({request}) {
            await authenticate.admin(request);
            return null;
          }
        `,
    },
    {
      // Test case: TypeScript file with proper imports and headers export
      // Should: Pass without any errors
      filename: 'test.ts',
      code: `
          import {authenticate} from '../shopify.server';
          import {boundary} from "@shopify/shopify-app-remix/server";
          import type {HeadersFunction} from "@remix-run/node";
          
          export const headers: HeadersFunction = (headersArgs) => {
            return boundary.headers(headersArgs);
          };

          export async function loader({request}) {
            await authenticate.admin(request);
            return null;
          }
        `,
    },
    {
      // Test case: File has custom headers implementation
      // Should: Pass as we only check for headers export existence
      code: `
          import {authenticate} from '../shopify.server';
          
          export const headers = () => {
            return new Headers({
              'Custom-Header': 'custom-value',
            });
          };

          export async function loader({request}) {
            await authenticate.admin(request);
            return null;
          }
        `,
    },
  ],
  invalid: [
    {
      // Test case: JavaScript file missing headers export
      code: `
          import {authenticate} from '../shopify.server';
          import {boundary} from "@shopify/shopify-app-remix/server";
          
          export async function loader({request}) {
            await authenticate.admin(request);
            return null;
          }
        `,
      errors: [
        {
          message:
            'Files using authenticate.admin() or authenticate.public.* must export a headers function',
        },
      ],
      output: `
          import {authenticate} from '../shopify.server';
          import {boundary} from "@shopify/shopify-app-remix/server";
          
          export async function loader({request}) {
            await authenticate.admin(request);
            return null;
          }

          export const headers = (headersArgs) => {
            return boundary.headers(headersArgs);
          };        

        `,
    },
    {
      // Test case: TypeScript file missing everything
      filename: 'test.ts',
      code: `
          import {authenticate} from '../shopify.server';
          
          export async function loader({request}) {
            await authenticate.admin(request);
            return null;
          }
        `,
      errors: [
        {
          message:
            'Files using authenticate.admin() or authenticate.public.* must export a headers function',
        },
      ],
      output: `
          import {authenticate} from '../shopify.server';
          import {boundary} from "@shopify/shopify-app-remix/server";
          import type {HeadersFunction} from "@remix-run/node";
          
          export async function loader({request}) {
            await authenticate.admin(request);
            return null;
          }

          export const headers: HeadersFunction = (headersArgs) => {
            return boundary.headers(headersArgs);
          };        

        `,
    },
    {
      // Test case: TypeScript file with boundary import but missing type import
      filename: 'test.ts',
      code: `
          import {authenticate} from '../shopify.server';
          import {boundary} from "@shopify/shopify-app-remix/server";
          
          export async function loader({request}) {
            await authenticate.admin(request);
            return null;
          }
        `,
      errors: [
        {
          message:
            'Files using authenticate.admin() or authenticate.public.* must export a headers function',
        },
      ],
      output: `
          import {authenticate} from '../shopify.server';
          import {boundary} from "@shopify/shopify-app-remix/server";
          import type {HeadersFunction} from "@remix-run/node";
          
          export async function loader({request}) {
            await authenticate.admin(request);
            return null;
          }

          export const headers: HeadersFunction = (headersArgs) => {
            return boundary.headers(headersArgs);
          };        

        `,
    },
  ],
});

console.log('All tests passed!');
