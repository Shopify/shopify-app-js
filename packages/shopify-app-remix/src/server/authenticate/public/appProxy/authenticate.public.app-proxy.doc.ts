import {ReferenceEntityTemplateSchema} from '@shopify/generate-docs';

const data: ReferenceEntityTemplateSchema = {
  name: 'App proxy',
  description:
    '[App proxies](/docs/apps/online-store/app-proxies) take requests to Shopify links, and redirect them to external links.' +
    '\nThe `authenticate.public.appProxy` function validates requests made to app proxies, and returns a context to enable querying Shopify APIs.' +
    '\n\n> Note: If the store has not installed the app, store-related properties such as `admin` or `storefront` will be `undefined`',
  category: 'Authenticate',
  subCategory: 'Public',
  type: 'object',
  isVisualComponent: false,
  definitions: [
    {
      title: 'authenticate.public.appProxy',
      description:
        'Authenticates requests coming to the app from Shopify app proxies.',
      type: 'AuthenticateAppProxy',
    },
  ],
  defaultExample: {
    description: 'Authenticate and fetch product information',
    codeblock: {
      title: 'Authenticate and fetch product information',
      tabs: [
        {
          title: '/app/routes/**.ts',
          language: 'typescript',
          code: './authenticate.public.app-proxy.doc.example.ts',
        },
      ],
    },
  },
  jsDocTypeExamples: ['AppProxyContextWithSession'],
  related: [
    {
      name: 'Admin API context',
      subtitle: 'Interact with the Admin API.',
      url: '/docs/api/shopify-app-remix/apis/admin-api',
    },
    {
      name: 'Storefront API context',
      subtitle: 'Interact with the Storefront API.',
      url: '/docs/api/shopify-app-remix/apis/storefront-api',
    },
    {
      name: 'Liquid reference',
      subtitle: "Use the shop's theme to render a template.",
      url: '/docs/api/liquid',
      type: 'liquid',
    },
  ],
};

export default data;
