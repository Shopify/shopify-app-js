import {ReferenceEntityTemplateSchema} from '@shopify/generate-docs';

const data: ReferenceEntityTemplateSchema = {
  name: 'Scopes',
  description:
    'Contains functions used to manage scopes for your app.\n\nThis object is returned on authenticated Admin requests.',
  category: 'APIs',
  type: 'object',
  isVisualComponent: false,
  definitions: [
    {
      title: 'scopes',
      description:
        'Provides utilities that apps can use to [manage scopes](https://shopify.dev/docs/apps/build/authentication-authorization/app-installation/manage-access-scopes) for the app using the Admin API.',
      type: 'ScopesApiContext',
    },
  ],
  jsDocTypeExamples: ['ScopesApiContext'],
  related: [
    {
      name: 'Admin context',
      subtitle: 'Authenticate requests from Shopify Admin.',
      url: '/docs/api/shopify-app-react-router/authenticate/admin',
    },
  ],
};

export default data;
