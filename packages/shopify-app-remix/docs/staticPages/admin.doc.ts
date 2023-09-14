import {LandingTemplateSchema} from '@shopify/generate-docs';

const data: LandingTemplateSchema = {
  id: 'guide-admin',
  title: 'Interacting with Shopify Admin',
  description:
    'Once you [set up your backend](/docs/api/shopify-app-remix#backend), you can use the [`authenticate.admin` function](/docs/api/shopify-app-remix/backend/authenticate-admin) to integrate your app with Shopify Admin.' +
    '\n\nThis function works for both embedded and non-embedded apps, and ensures the app is installed on the current store.' +
    '\n\nIt returns a context with functions to enable loaders and actions to respond to any requests made by or in Shopify Admin.' +
    '\n\nThis page goes over the basics of authenticating those requests, and some of the things you can do with it, like querying the Admin API.',
  sections: [
    {
      type: 'Generic',
      anchorLink: 'auth',
      title: 'Authenticating requests',
      sectionContent:
        'To authenticate admin requests you can call `authenticate.admin(request)` in a loader or an action.' +
        '\n\nIf there is a session for this user, this loader will return null. If there is no session for the user, the loader will throw the appropriate redirect Response.' +
        '\n\n> Tip: If you are authenticating more than one route, we recommend using [Remix layout routes](https://remix.run/docs/en/1.18.1/file-conventions/routes-files#layout-routes) to automatically authenticate them.',
      codeblock: {
        title: '/app/routes/**/*.tsx',
        tabs: [
          {
            title: '/app/routes/**/*.tsx',
            code: './examples/guides/admin/auth.example.tsx',
            language: 'tsx',
          },
        ],
      },
    },
    {
      type: 'Generic',
      anchorLink: 'headers',
      title: 'Headers',
      sectionContent:
        "It's important to note that the authentication functions in this package rely on throwing Response objects, which must be handled in your Remix routes using them." +
        '\n\nTo do that, you can set up a [Remix `ErrorBoundary`](https://remix.run/docs/en/main/guides/errors). We provide some abstractions for the error and headers boundaries to make it easier for apps to set those up.' +
        '\n\n> Tip: You can also add this to a layout if you want to authenticate more than one route.',
      codeblock: {
        title: '/app/routes/**/*.tsx',
        tabs: [
          {
            title: '/app/routes/**/*.tsx',
            code: './examples/guides/admin/headers.example.tsx',
            language: 'tsx',
          },
        ],
      },
    },
    {
      type: 'Generic',
      anchorLink: 'cors-auth',
      title: 'Authenticating cross-origin admin requests',
      sectionContent:
        'If your Remix server is authenticating an admin extension, a request from the extension to Remix will be cross-origin.' +
        '\n\nHere `authenticate.admin` provides a `cors` function to add the required cross-origin headers.',
      codeblock: {
        title: '/app/routes/**/*.tsx',
        tabs: [
          {
            title: '/app/routes/**/*.tsx',
            code: './examples/guides/admin/auth-cors.example.tsx',
            language: 'tsx',
          },
        ],
      },
    },
    {
      type: 'Generic',
      anchorLink: 'graphql-api',
      title: 'Using the GraphQL API',
      sectionContent:
        'Once a request is authenticated, `authenticate.admin` will return an `admin` object that contains a GraphQL client that can interact with the [Shopify Admin GraphQL API](/docs/api/admin-graphql).',
      codeblock: {
        title: '/app/routes/**/*.tsx',
        tabs: [
          {
            title: '/app/routes/**/*.tsx',
            code: './examples/guides/admin/graphql.example.tsx',
            language: 'tsx',
          },
        ],
      },
    },
    {
      type: 'Generic',
      anchorLink: 'rest-api',
      title: 'Using the REST API',
      sectionContent:
        'Once a request is authenticated, `authenticate.admin` will return an `admin` object that contains a REST client that can interact with the [Shopify Admin REST API](/docs/api/admin-rest).' +
        '\n\nYou can also import a set of resource classes from the `@shopify/shopify-api` package (included in `@shopify/shopify-app-remix`).' +
        '\n\nThese classes map to the individual REST endpoints, and will be returned under `admin.rest.resources`.',
      codeblock: {
        title: 'Interacting with the REST API',
        tabs: [
          {
            title: '/app/shopify.server.ts',
            code: './examples/guides/admin/rest-resources.example.tsx',
            language: 'tsx',
          },
          {
            title: '/app/routes/**/*.tsx',
            code: './examples/guides/admin/rest.example.tsx',
            language: 'tsx',
          },
        ],
      },
    },
    {
      type: 'Resource',
      title: 'Resources',
      anchorLink: 'resources',
      resources: [
        {
          name: 'authenticate.admin',
          url: '/docs/api/shopify-app-remix/authenticate/admin',
        },
      ],
    },
  ],
};

export default data;
