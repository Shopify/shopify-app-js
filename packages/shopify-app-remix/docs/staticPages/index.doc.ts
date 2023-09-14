import {LandingTemplateSchema} from '@shopify/generate-docs';

const data: LandingTemplateSchema = {
  id: 'shopify-app-remix',
  title: 'Shopify App package for Remix',
  description:
    'The @shopify/shopify-app-remix package enables Remix apps to authenticate with Shopify and make API calls. It uses [App Bridge](/docs/api/app-bridge-library) to enable apps to embed themselves in the Shopify Admin.' +
    "\n\nIn this page we'll go over the main components you need to integrate an app with Shopify." +
    '\n\n> Tip: The quickest way to create a new app is using the Shopify CLI. Check out the [getting started guide](/docs/apps/getting-started/create), or the [app template](https://github.com/Shopify/shopify-app-template-remix) for a complete example.',
  sections: [
    {
      type: 'Generic',
      anchorLink: 'install',
      title: 'Install',
      sectionContent:
        "If you're not using the CLI, you can use the examples in this page to set up an existing app to use this package. Start by installing it using your preferred package manager.",
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
      title: 'Backend setup',
      sectionContent:
        'All of the backend features provided by this package are available through the `shopifyApp` function.' +
        '\n\nThis function creates an object that can authenticate requests from Shopify, create contexts for non-Shopify requests, and much more.' +
        "\n\n> Caution: When running on a node environment, you'll also need to import the node adapter, as per the example.",
      sectionCard: [
        {
          name: 'shopifyApp',
          url: '/docs/api/shopify-app-remix/backend/shopifyapp',
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
      anchorLink: 'headers',
      title: 'Response headers',
      sectionContent:
        'When loading inside the Shopify Admin, your app will need to add the required `Content-Security-Policy` header directives, as per [our documentation](/docs/apps/store/security/iframe-protection). To do that, this package provides the `shopify.addDocumentResponseHeaders` method.' +
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
      anchorLink: 'boundaries',
      title: 'Error boundaries',
      sectionContent:
        'The authentication functions in this package rely on throwing `Response` objects, which must be handled in your Remix routes using them.' +
        '\n\nTo do that, you can set up a [Remix `ErrorBoundary`](https://remix.run/docs/en/main/guides/errors). We provide some abstractions for the error and headers boundaries to make it easier for apps to set those up.' +
        '\n\n> Tip: You can also add this to a [Remix layout](https://remix.run/docs/en/main/file-conventions/route-files-v2) if you want to authenticate more than one route.',
      codeblock: {
        title: '/app/routes/**/*.tsx',
        tabs: [
          {
            title: '/app/routes/**/*.tsx',
            language: 'tsx',
            code: './examples/index/boundaries.example.ts',
          },
        ],
      },
    },
    {
      type: 'Generic',
      anchorLink: 'auth-route',
      title: 'OAuth route',
      sectionContent:
        "To install an app or refresh tokens, you'll need to set up an [OAuth](docs/apps/auth/oauth) route. To do that, set up a [splat route](https://remix.run/docs/en/main/guides/routing#splats) that calls `authenticate.admin`." +
        '\n\nWhen that function is called, the package will start the OAuth process, and handle the callback from Shopify after it completes.' +
        '\n\nThe default route is `/app/routes/auth/$.tsx`, but you can configure this route using the `authPathPrefix` option.',
      codeblock: {
        title: '/app/routes/auth/$.tsx',
        tabs: [
          {
            title: '/app/routes/auth/$.tsx',
            language: 'ts',
            code: './examples/index/splat-route.example.ts',
          },
        ],
      },
    },
    {
      type: 'Generic',
      anchorLink: 'app-provider',
      title: 'AppProvider',
      sectionContent:
        "In order to use all of the features from App Bridge, you'll need to use the `AppProvider` component in your app's routes." +
        '\n\nThis component will set up App Bridge and Polaris so you can integrate your app into the Shopify Admin, and it helps us ensure your app stays up to date with Shopify requirements.' +
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
          url: '/docs/api/shopify-app-remix/frontend/appprovider',
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
  ],
};

export default data;
