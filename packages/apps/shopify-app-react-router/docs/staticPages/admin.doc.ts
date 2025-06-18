import {LandingTemplateSchema} from '@shopify/generate-docs';

const data: LandingTemplateSchema = {
  id: 'guide-admin',
  title: 'Interacting with Shopify Admin',
  description:
    'Once you [set up your backend](/docs/api/shopify-app-react-router#shopify-app), you can use the [`authenticate.admin` function](/docs/api/shopify-app-react-router/authenticate/admin) to integrate your app with Shopify Admin.' +
    '\n\nThis function ensures the app is installed on the current store and handles authentication for both embedded apps and merchant custom apps (distributed via AppDistribution.ShopifyAdmin).' +
    '\n\nIt returns a context with functions to enable loaders and actions to respond to any requests made by or in Shopify Admin.' +
    '\n\nThis page goes over the basics of authenticating those requests, and some of the things you can do with it, like querying the Admin API.',
  sections: [
    {
      type: 'Generic',
      anchorLink: 'auth',
      title: 'Authenticating requests',
      sectionContent:
        'To authenticate admin requests you can call `authenticate.admin(request)` in a loader or an action.' +
        "\n\nIf there's a session for this user, then this loader will return null. If there's no session for the user, then the loader will throw the appropriate redirect Response." +
        '\n\n> Tip: If you are authenticating more than one route, then we recommend using [React router layout routes](https://reactrouter.com/start/framework/routing#layout-routes) to automatically authenticate them.',
      codeblock: {
        title: 'Authenticating requests',
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
        "The OAuth process can't happen inside the admin iframe, and this package is capable of detecting that scenario and properly redirecting using the [React Router `ErrorBoundary`](https://reactrouter.com/how-to/error-boundary) export to set the correct headers for App Bridge." +
        '\n\nUse the abstractions provided by this package in your authenticated routes, to automatically set up the error and headers boundaries to redirect outside the iframe when needed.' +
        '\n\n> Tip: You can also add this to a [React router layout](https://reactrouter.com/start/framework/routing#layout-routes) if you want to authenticate more than one route, but make sure to call the Shopify boundary methods whenever you need to add your own exports.',
      codeblock: {
        title: 'Configure header boundaries',
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
        'If your React Router server is authenticating an admin extension, then a request from the extension to the server will be cross-origin.' +
        '\n\nHere `authenticate.admin` provides a `cors` function to add the required cross-origin headers.',
      codeblock: {
        title: 'Add cross-origin headers',
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
        'Once a request is authenticated, `authenticate.admin` will return an `admin` object that contains a GraphQL client that can interact with the [GraphQL Admin API](/docs/api/admin-graphql).',
      codeblock: {
        title: 'Make GraphQL requests',
        tabs: [
          {
            title: '/app/routes/**/*.tsx',
            code: './examples/guides/admin/graphql.example.tsx',
            language: 'tsx',
          },
        ],
      },
      sectionCard: [
        {
          url: '/docs/api/shopify-app-react-router/guide-graphql-types',
          name: 'Typing GraphQL operations',
          type: 'tutorial',
        },
      ],
    },
    {
      type: 'Generic',
      anchorLink: 'graphql-api-background',
      title: 'Using the GraphQL API in background jobs',
      sectionContent: "You may need to interact with the Admin API when working outside of Shopify requests. To do so use the `unauthenticated.admin` function." +
          "\n\nThis enables apps to integrate with 3rd party services and perform background tasks." +
          "\n\n> Caution:" +
          "\n> This function doesn't perform **any** validation and shouldn't rely on raw user input." +
          "\n\nWhen using this function, consider the following:" +
          "\n\n#### Background tasks" +
          "\n\nApps should ensure that the shop domain is authenticated when enqueueing jobs." +
          "\n\n#### 3rd party service requests" +
          "\n\nApps must obtain the shop domain from the 3rd party service in a secure way.",
      codeblock: {
        title: 'Make GraphQL requests in background jobs',
        tabs: [
          {
            title: '/app/jobs/**/*.tsx',
            code: './examples/guides/admin/unauthenticated.example.tsx',
            language: 'tsx',
          },
        ],
      },
      sectionCard: [
        {
          url: '/docs/api/shopify-app-react-router/unauthenticated/unauthenticated-admin',
          name: 'Unauthenticated Admin',
          type: 'tutorial',
        },
      ],
    },
    {
      type: 'Resource',
      title: 'Resources',
      anchorLink: 'resources',
      resources: [
        {
          name: 'authenticate.admin',
          url: '/docs/api/shopify-app-react-router/authenticate/admin',
        },
      ],
    },
  ],
};

export default data;
