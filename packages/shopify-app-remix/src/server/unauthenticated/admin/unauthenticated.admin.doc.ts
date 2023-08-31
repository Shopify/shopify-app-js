import {ReferenceEntityTemplateSchema} from '@shopify/generate-docs';

const data: ReferenceEntityTemplateSchema = {
  name: 'Unauthenticated admin',
  description:
    "Allows interacting with the Admin API on requests that didn't come from Shopify.\n\nGo to the [Related](#related) section to see all supported actions in `admin`.\n\n> Caution: This should only be used for Requests that do not originate from Shopify.\n> You must do your own authentication before using this method.\n>This function does not perform **any** validation and should not rely on unvalidated user input.",
  category: 'backend',
  subCategory: 'Unauthenticated',
  type: 'object',
  isVisualComponent: false,
  definitions: [
    {
      title: 'unauthenticated.admin',
      description: 'Creates an unauthenticated Admin context.',
      type: 'UnauthenticatedAdmin',
    },
    {
      title: 'UnauthenticatedAdminContext',
      description: 'Object returned by `authenticate.admin`.',
      type: 'UnauthenticatedAdminContext',
      jsDocExamples: true,
    },
  ],
  related: [
    {
      name: 'API context',
      subtitle: 'Interact with the Admin API.',
      url: '/docs/api/shopify-app-remix/backend/admin-features/admin-api',
    },
  ],
};

export default data;
