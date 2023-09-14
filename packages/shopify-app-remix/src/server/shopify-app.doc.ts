import {ReferenceEntityTemplateSchema} from '@shopify/generate-docs';

const data: ReferenceEntityTemplateSchema = {
  name: 'shopifyApp',
  description:
    "Returns a set of functions that can be used by the app's backend to be able to respond to all Shopify requests.\n\nThe shape of the returned object changes depending on the value of `distribution`. If it is `AppDistribution.ShopifyAdmin`, only `ShopifyAppBase` objects are returned, otherwise `ShopifyAppLogin` objects are included.\n\nRefer to the [Related](#related) section to see all supported contexts in `authenticate` and `unauthenticated`.",
  category: 'backend',
  type: 'function',
  isVisualComponent: false,
  definitions: [
    {
      title: 'shopifyApp',
      description: 'Function to create a new Shopify API object.',
      type: 'ShopifyAppGeneratedType',
      jsDocExamples: true,
    },
    {
      title: 'ShopifyAppBase',
      description:
        'Functions shared across all apps, regardless of the `distribution` config.',
      type: 'ShopifyAppBase',
      jsDocExamples: true,
    },
    {
      title: 'ShopifyAppLogin',
      description:
        'Functions returned for apps capable of showing a login page.',
      type: 'ShopifyAppLogin',
      jsDocExamples: true,
    },
  ],
  related: [
    {
      name: 'Authenticated contexts',
      subtitle: 'Authenticate requests coming from Shopify.',
      url: '/docs/api/shopify-app-remix/backend/authenticate-overview',
    },
    {
      name: 'Unauthenticated contexts',
      subtitle: 'Interact with the API on non-Shopify requests.',
      url: '/docs/api/shopify-app-remix/backend/unauthenticated-overview',
    },
  ],
};

export default data;
