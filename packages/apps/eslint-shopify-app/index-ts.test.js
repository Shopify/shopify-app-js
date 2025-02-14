import {RuleTester} from 'eslint';
import * as parser from '@typescript-eslint/parser';
import dedent from 'dedent';

// eslint-disable-next-line import/extensions
import shopifyAppRule from './index.js';

const ruleTester = new RuleTester({
  parser,
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
});

ruleTester.run('shopify-app-headers', shopifyAppRule, {
  valid: [
    // Valid case: No authenticate calls
    {
      code: dedent`
        export const loader = () => {
          return json({ data: 'test' });
        };
      `,
      filename: 'test.ts',
    },
    // Valid case: Has authenticate call and headers export (TypeScript)
    {
      code: dedent`
        import {authenticate} from '@shopify/shopify-app-remix/server';
        import type {HeadersFunction} from '@remix-run/node';
        import {boundary} from '@shopify/shopify-app-remix/server';

        export const loader = async ({request}) => {
          await authenticate.admin(request);
          return json({ data: 'test' });
        };

        export const headers: HeadersFunction = (args) => {
          return boundary.headers(args);
        };
      `,
      filename: 'test.ts',
    },
  ],
  invalid: [
    // Invalid case: Has authenticate call but no headers export (TypeScript)
    {
      code: dedent`
        import {authenticate} from '@shopify/shopify-app-remix/server';

        export const loader = async ({request}) => {
          await authenticate.admin(request);
          return json({ data: 'test' });
        };
      `,
      filename: 'test.ts',
      errors: [
        {
          message:
            'Files using authenticate.admin() or authenticate.public.* must export a headers function',
        },
      ],
      output: dedent`
        import {authenticate} from '@shopify/shopify-app-remix/server';
        import {boundary} from "@shopify/shopify-app-remix/server";
        import type {HeadersFunction} from "@remix-run/node";

        export const loader = async ({request}) => {
          await authenticate.admin(request);
          return json({ data: 'test' });
        };

        export const headers: HeadersFunction = (headersArgs) => {
          return boundary.headers(headersArgs);
        };
      `,
    },
  ],
});
