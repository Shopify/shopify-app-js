import {ReferenceEntityTemplateSchema} from '@shopify/generate-docs';

const data: ReferenceEntityTemplateSchema = {
  name: 'shopifyApp',
  description:
    "Returns a set of functions that can be used by the app's backend to be able to respond to all Shopify requests." +
    '\n\nThe shape of the returned object changes depending on the value of `distribution`. If it is `AppDistribution.ShopifyAdmin`, then only `ShopifyAppBase` objects are returned, otherwise `ShopifyAppLogin` objects are included.',
  category: 'Entrypoints',
  type: 'function',
  isVisualComponent: false,
  definitions: [
    {
      title: 'shopifyApp',
      description: 'Function to create a new Shopify API object.',
      type: 'ShopifyAppGeneratedType',
    },
  ],
  jsDocTypeExamples: [
    'ShopifyAppGeneratedType',
    'ShopifyAppBase',
    'ShopifyAppLogin',
  ],
  related: [
    {
      name: 'Authenticated contexts',
      subtitle: 'Authenticate requests coming from Shopify.',
      url: '/docs/api/shopify-app-remix/authenticate',
    },
    {
      name: 'Unauthenticated contexts',
      subtitle: 'Interact with the API on non-Shopify requests.',
      url: '/docs/api/shopify-app-remix/unauthenticated',
    },
  ],
};

export default data;
