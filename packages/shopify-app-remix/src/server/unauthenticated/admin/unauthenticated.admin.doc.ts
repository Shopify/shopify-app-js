import {ReferenceEntityTemplateSchema} from '@shopify/generate-docs';

const data: ReferenceEntityTemplateSchema = {
  name: 'Unauthenticated admin',
  description:
    "Allows interacting with the Admin API on requests that didn't come from Shopify." +
    '\n\n> Caution: This should only be used for Requests that do not originate from Shopify.' +
    '\n> You must do your own authentication before using this method.' +
    "\n>This function doesn't perform **any** validation and shouldn't rely on unvalidated user input.",
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
  jsDocTypeExamples: ['UnauthenticatedAdminContext', 'AdminApiContext'],
  related: [
    {
      name: 'API context',
      subtitle: 'Interact with the Admin API.',
      url: '/docs/api/shopify-app-remix/apis/admin-api',
    },
  ],
};

export default data;
