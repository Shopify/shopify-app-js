import {LandingTemplateSchema} from '@shopify/generate-docs';

const data: LandingTemplateSchema = {
  id: 'shopify-app-remix',
  title: 'Shopify App package for Remix',
  description:
    'The @shopify/shopify-app-remix package enables Remix apps to authenticate with Shopify and make API calls. It uses [App Bridge](/docs/api/app-bridge-library) to enable apps to embed themselves in the Shopify Admin.',
  sections: [
    {
      type: 'Generic',
      anchorLink: 'install',
      title: 'Install',
      sectionContent:
        'The quickest way to create a new app is using the Shopify CLI. You can follow the getting started guide to create a new app that uses this package.' +
        '\n\nYou can follow the instructions on this page to set up an existing app to use this package. Start by installing it using your preferred package manager.',
      sectionCard: [
        {
          name: 'Build an app',
          subtitle: 'Navigate to',
          url: '/docs/apps/getting-started/build-qr-code-app',
          type: 'tutorial',
        },
      ],
      codeblock: {
        title: 'Install package',
        tabs: [
          {
            title: 'npm',
            code: './examples/index/install.npm.example.sh',
          },
          {
            title: 'yarn',
            code: './examples/index/install.yarn.example.sh',
          },
          {
            title: 'pnpm',
            code: './examples/index/install.pnpm.example.sh',
          },
        ],
      },
    },
    {
      type: 'Generic',
      anchorLink: 'shopify-app',
      title: 'Create the Shopify object',
      sectionContent:
        'The first thing you need to do is to call the `shopifyApp` function, so you can get context objects for your app.' +
        "\n\n> Caution: When running on a node environment, you'll also need to import the node adapter, as per the example.",
      sectionCard: [
        {
          name: 'shopifyApp',
          url: '/docs/api/shopify-app-remix/v1/backend/shopifyapp',
          type: 'clicode',
        },
      ],
      codeblock: {
        title: '/app/shopify.server.ts',
        tabs: [
          {
            title: '/app/shopify.server.ts',
            language: 'ts',
            code: './examples/index/shopify-app.example.ts',
          },
        ],
      },
    },
    {
      type: 'Generic',
      anchorLink: 'auth-route',
      title: 'Create an auth route',
      sectionContent:
        "Next, you'll need a [splat route](https://remix.run/docs/en/main/guides/routing#splats) to enable your app to complete the [OAuth process](https://shopify.dev/docs/apps/auth/oauth) and retrieve an access token to the Shopify API." +
        '\n\nWhen a route calls `authenticate.admin`, the package will start OAuth to install the app or refresh tokens, and handle the callback from Shopify after it completes.' +
        "\n\nWhen the `authenticate` methods return, that means the request is valid and you can run your app's logic." +
        '\n\nThe default route is `/app/routes/auth/$.tsx`, but you can configure this route using the `authPathPrefix` option.',
      codeblock: {
        title: '/app/routes/auth/$.ts',
        tabs: [
          {
            title: '/app/routes/auth/$.ts',
            language: 'ts',
            code: './examples/index/splat-route.example.ts',
          },
        ],
      },
    },
    {
      type: 'Generic',
      anchorLink: 'headers',
      title: 'Set up response headers',
      sectionContent:
        'Now that your app is ready to respond to requests, it will also need to add the required Content-Security-Policy header directives, as per [our documentation](/docs/apps/store/security/iframe-protection). To do that, this package provides the shopify.addDocumentResponseHeaders method.' +
        "\n\nYou should return these headers from any endpoint that renders HTML in your app. Most likely you'll want to add this to every HTML response by updating the `entry.server.tsx` file:",
      codeblock: {
        title: '/app/entry.server.tsx',
        tabs: [
          {
            title: '/app/entry.server.tsx',
            language: 'tsx',
            code: './examples/index/entry-server.example.ts',
          },
        ],
      },
    },
    {
      type: 'Generic',
      anchorLink: 'app-provider',
      title: 'Set up AppProvider',
      sectionContent:
        "Next, set up the `AppProvider` component in your app's routes. This component will set up App Bridge and Polaris so you can integrate your app into the Shopify Admin." +
        '\n\nTo do this pass the `process.env.SHOPIFY_API_KEY` to the frontend via the loader.',
      sectionCard: [
        {
          name: 'App bridge',
          subtitle: 'Learn more about App Bridge.',
          url: '/docs/api/app-bridge-library',
          type: 'shopify',
        },
        {
          name: 'Polaris',
          subtitle: 'Learn more about Polaris.',
          url: 'https://polaris.shopify.com',
          type: 'shopify',
        },
        {
          name: 'AppProvider',
          url: '/docs/api/shopify-app-remix/v1/frontend/appprovider',
          type: 'clicode',
        },
      ],
      codeblock: {
        title: '/app/root.tsx',
        tabs: [
          {
            title: '/app/root.tsx',
            language: 'tsx',
            code: './examples/index/app-provider.example.ts',
          },
        ],
      },
    },
    {
      type: 'Generic',
      anchorLink: 'boundaries',
      title: 'Set up error boundaries',
      sectionContent:
        "It's important to note that the authentication functions in this package rely on throwing Response objects, which must be handled in your Remix routes using them." +
        '\n\nTo do that, you can set up a [Remix `ErrorBoundary`](https://remix.run/docs/en/main/guides/errors). We provide some abstractions for the error and headers boundaries to make it easier for apps to set those up.' +
        '\n\n> Tip: You can also add this to a layout if you want to authenticate more than one route.',
      codeblock: {
        title: '/app/root.tsx',
        tabs: [
          {
            title: '/app/root.tsx',
            language: 'tsx',
            code: './examples/index/boundaries.example.ts',
          },
        ],
      },
    },
  ],
};

export default data;
