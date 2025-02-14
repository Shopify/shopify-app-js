import {TSESLint} from '@typescript-eslint/utils';
import dedent from 'dedent';

import rule from './index.js';

const ruleTester = new TSESLint.RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    project: null,
  },
});

console.info('Running headers export test');
ruleTester.run('shopify-app-headers', rule, {
  valid: [
    {
      // Test case: File has authenticate.admin() call with proper headers export
      // Should: Pass without any errors
      code: dedent`
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
      filename: 'test.ts',
    },
    {
      // Test case: File has authenticate.public.pos() call with proper headers export
      // Should: Pass without any errors
      code: dedent`
          import {authenticate} from '../shopify.server';
          import {boundary} from "@shopify/shopify-app-remix/server";
          
          export const headers = (headersArgs) => {
            return boundary.headers(headersArgs);
          };

          export async function loader({request}) {
            await authenticate.public.pos(request);
            return null;
          }
        `,
      filename: 'test.ts',
    },
    {
      // Test case: File has authenticate.admin() call with custom headers implementation
      // Should: Pass as we only check for headers export existence, not its implementation
      code: dedent`
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
      filename: 'test.ts',
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
          }
        `,
      filename: 'test.ts',
      errors: [{messageId: 'missingHeaders'}],
      output: dedent`
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
      // Test case: File has authenticate.public.pos() call but missing headers export
      // Should: Fail and auto-fix by adding the headers export
      code: dedent`
          import {authenticate} from '../shopify.server';
          
          export async function loader({request}) {
            await authenticate.public.pos(request);
            return null;
          }
        `,
      filename: 'test.ts',
      errors: [{messageId: 'missingHeaders'}],
      output: dedent`
          import {authenticate} from '../shopify.server';
          import {boundary} from "@shopify/shopify-app-remix/server";

          export async function loader({request}) {
            await authenticate.public.pos(request);
            return null;
          }

          export const headers = (headersArgs) => {
            return boundary.headers(headersArgs);
          };        

        `,
    },
  ],
});
