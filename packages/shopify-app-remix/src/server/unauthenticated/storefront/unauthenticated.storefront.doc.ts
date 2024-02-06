import {ReferenceEntityTemplateSchema} from '@shopify/generate-docs';

const data: ReferenceEntityTemplateSchema = {
  name: 'Unauthenticated storefront',
  description:
    "Allows interacting with the Storefront API on requests that didn't come from Shopify, which enables apps to integrate with 3rd party services." +
    "\n\nBecause the request isn't sent by Shopify, this package isn't able to authenticate the request." +
    '\nIn that case, it is up to the app to obtain the shop domain from the 3rd party service in a secure way.' +
    '\n\n> Caution:' +
    "\n> This function doesn't perform **any** validation and shouldn't rely on raw user input.",
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
