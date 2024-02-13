import {ReferenceEntityTemplateSchema} from '@shopify/generate-docs';

const data: ReferenceEntityTemplateSchema = {
  name: 'Unauthenticated admin',
  description: `Allows interacting with the Admin API when working outside of Shopify requests.
This enables apps to integrate with 3rd party services and perform background tasks.

> Caution:
> This function doesn't perform **any** validation and shouldn't rely on raw user input.

When using this function, consider the following:

#### Background tasks

Apps should ensure that the shop domain is authenticated when enqueueing jobs.

#### 3rd party service requests

Apps must obtain the shop domain from the 3rd party service in a secure way.`,
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
