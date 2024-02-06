import {ReferenceEntityTemplateSchema} from '@shopify/generate-docs';

const data: ReferenceEntityTemplateSchema = {
  name: 'Unauthenticated admin',
  description:
    "Allows interacting with the Admin API on requests that didn't come from Shopify, which enables apps to integrate with 3rd party services." +
    "\n\nBecause the request isn't sent by Shopify, this package isn't able to authenticate the request." +
    '\nIn that case, it is up to the app to obtain the shop domain from the 3rd party service in a secure way.' +
    '\n\n> Caution:' +
    "\n> This function doesn't perform **any** validation and shouldn't rely on raw user input.",
  category: 'Unauthenticated',
  type: 'object',
  isVisualComponent: false,
  definitions: [
    {
      title: 'unauthenticated.admin',
      description: 'Creates an unauthenticated Admin context.',
      type: 'GetUnauthenticatedAdminContext',
    },
  ],
  jsDocTypeExamples: ['UnauthenticatedAdminContext'],
  related: [
    {
      name: 'API context',
      subtitle: 'Interact with the Admin API.',
      url: '/docs/api/shopify-app-remix/apis/admin-api',
    },
  ],
};

export default data;
