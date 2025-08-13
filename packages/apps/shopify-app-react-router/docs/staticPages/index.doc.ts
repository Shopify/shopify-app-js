import {LandingTemplateSchema} from '@shopify/generate-docs';

const data: LandingTemplateSchema = {
  id: 'shopify-app-react-router',
  title: 'Shopify App package for React Router',
  description:
    'The [@shopify/shopify-app-react-router](https://www.npmjs.com/package/@shopify/shopify-app-react-router) package enables [React Router](https://reactrouter.com/home) apps to authenticate with Shopify and make API calls. It uses [App Bridge](/docs/api/app-bridge-library) to enable apps to embed themselves in the Shopify Admin.' +
    '\n\nOn this page learn the key concepts when building an app with this package.',
  sections: [
    {
      type: 'Generic',
      anchorLink: 'quick-start',
      title: 'Quick start',
      sectionContent:
        'The quickest way to create a new app is using the Shopify CLI, and the Shopify App Template.' +
        '\n\nCheck out the [getting started guide](/docs/apps/build/scaffold-app), or the [app template](https://github.com/Shopify/shopify-app-template-react-router).',
      codeblock: {
        title: 'Create an app',
        tabs: [
          {
            title: 'Terminal',
            language: 'sh',
            code: './examples/index/create.example.sh',
          },
        ],
      },
    },
    {
      type: 'Generic',
      anchorLink: 'shopify-app',
      title: 'Configure the package',
      sectionContent:
        "Using the `shopifyApp` function, you can configure the package's functionality for different app distributions types, access tokens, logging levels and future flags.",
      sectionCard: [
        {
          name: 'shopifyApp',
          url: '/docs/api/shopify-app-react-router/entrypoints/shopifyapp',
          type: 'clicode',
        },
      ],
      codeblock: {
        title: 'Configure ShopifyApp',
        tabs: [
          {
            title: '/app/shopify.server.ts',
            language: 'ts',
            code: './examples/index/shopify-app.example.tsx',
          },
        ],
      },
    },
    {
      type: 'Generic',
      anchorLink: 'graphql-request',
      title: 'Make Admin API GraphQL requests',
      sectionContent:
        'Authenticated requests with the Admin API GraphQL client are made by calling the `admin.graphql` function. This function returns a GraphQL client that is authenticated with the Admin API.',
      sectionCard: [
        {
          name: 'admin.graphql',
          url: '/docs/api/shopify-app-react-router/v0/guide-admin#graphql-api',
          type: 'clicode',
        },
      ],
      codeblock: {
        title: 'Make a GraphQL request',
        tabs: [
          {
            title: '/app/routes/admin/$.tsx',
            language: 'tsx',
            code: './examples/index/admin-graphql.example.tsx',
          },
        ],
      },
    },
    {
      type: 'Generic',
      anchorLink: 'add-routes',
      title: 'Add a new route to your app',
      sectionContent:
        'Routes embedded in the Shopify Admin must be nested under an Admin layout route for proper authentication and functionality. ' +
        '\n\nThe template includes an admin route at `/app/routes/app.tsx` that handles App Bridge initialization, authenticates requests via `authenticate.admin`, provides error boundaries and headers required by the admin. ' +
        '\n\nWhen creating new routes, place them in the `/app/routes/` directory with the `app.` prefix (e.g., `app.products.tsx`) to ensure they inherit these features. ' +
        'This structure ensures your app behaves correctly within the Shopify Admin and has access to authenticated API clients.',
      codeblock: {
        title: 'Add a route',
        tabs: [
          {
            title: '/app/routes/app.new.tsx',
            language: 'tsx',
            code: './examples/index/new-route.example.tsx',
          },
          {
            title: '/app/routes/app.tsx',
            language: 'tsx',
            code: './examples/index/setup-admin-layout.example.tsx',
          },
        ],
      },
    },
    {
      type: 'Generic',
      anchorLink: 'authenticate-webhook',
      title: 'Authenticate Webhook Requests',
      sectionContent:
        'The package provide functions to authenticate webhook requests. This function returns a webhook client that is authenticated with the Admin API.' +
        '\n\n> Note: Ensure your webhook route is not nested under you app layout route.',
      sectionCard: [
        {
          name: 'authenticate.webhook',
          url: '/docs/api/shopify-app-react-router/v0/authenticate/webhook',
          type: 'clicode',
        },
      ],
      codeblock: {
        title: 'Authenticate Webhook Requests',
        tabs: [
          {
            title: '/app/routes/webhooks.app.product_updated.tsx',
            language: 'tsx',
            code: './examples/index/webhook.example.tsx',
          },
        ],
      },
    },
    {
      type: 'Generic',
      anchorLink: 'session-storage',
      title: 'Session Storage',
      sectionContent:
        'When using this package, installed shops access tokens will be stored in session storage.' +
        'You can configure the storage mechanism by passing a custom storage object to the `shopifyApp` function.' +
        'By default, the template will use Prisma and SQLite, but other session storage adapters are available.' +
        '\n\n> Note: The type of session storage you use may impact how your app will be deployed.',
      sectionCard: [
        {
          name: 'Session Storage',
          url: 'https://github.com/Shopify/shopify-app-js/tree/main/packages/apps/session-storage',
          type: 'clicode',
        },
      ],
      codeblock: {
        title: 'Session Storage',
        tabs: [
          {
            title: '/app/shopify.server.ts',
            language: 'ts',
            code: './examples/index/session-storage.example.tsx',
          },
        ],
      },
    },
    {
      type: 'Generic',
      anchorLink: 'deploy-app',
      title: 'Deploy your app',
      sectionContent:
        'You can deploy your app to your preferred hosting service that is compatible with JavaScript apps. ' +
        'Review our deployment guide to learn about the requirements for deploying your app.',
      sectionCard: [
        {
          name: 'Deploy your app',
          url: '/docs/apps/launch/deployment',
          type: 'clicode',
        },
      ],
    },
  ],
};

export default data;
