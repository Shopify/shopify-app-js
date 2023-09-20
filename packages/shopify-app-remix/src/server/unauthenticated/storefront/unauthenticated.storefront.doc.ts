import {ReferenceEntityTemplateSchema} from '@shopify/generate-docs';

const data: ReferenceEntityTemplateSchema = {
  name: 'Unauthenticated storefront',
  description:
    "Allows interacting with the Storefront API on requests that didn't come from Shopify." +
    '\n\n> Caution: This should only be used for Requests that do not originate from Shopify.' +
    '\n> You must do your own authentication before using this method.' +
    "\n>This function doesn't perform **any** validation and shouldn't rely on unvalidated user input.",
  category: 'Unauthenticated',
  type: 'object',
  isVisualComponent: false,
  definitions: [
    {
      title: 'unauthenticated.storefront',
      description: 'Creates an unauthenticated Storefront context.',
      type: 'GetUnauthenticatedStorefrontContext',
    },
  ],
  jsDocTypeExamples: ['UnauthenticatedStorefrontContext', 'StorefrontContext'],
  related: [
    {
      name: 'API context',
      subtitle: 'Interact with the Storefront API.',
      url: '/docs/api/shopify-app-remix/apis/storefront-api',
    },
  ],
};

export default data;
