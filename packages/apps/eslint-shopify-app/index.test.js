import {RuleTester} from 'eslint';
import dedent from 'dedent';

// eslint-disable-next-line import/extensions
import shopifyAppRule from './index.js';

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
});

console.info('Running headers export test');
ruleTester.run('shopify-app-headers', shopifyAppRule, {
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
      errors: [
        {
          message:
            'Files using authenticate.admin() or authenticate.public.* must export a headers function',
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
      errors: [
        {
          message:
            'Files using authenticate.admin() or authenticate.public.* must export a headers function',
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
          };        

        `,
    },
  ],
});
