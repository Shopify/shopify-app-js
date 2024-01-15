import {LandingTemplateSchema} from '@shopify/generate-docs';

const data: LandingTemplateSchema = {
  id: 'shopify-app-remix',
  title: 'Shopify App package for Remix',
  description:
    'The [@shopify/shopify-app-remix](https://www.npmjs.com/package/@shopify/shopify-app-remix) package enables Remix apps to authenticate with Shopify and make API calls. It uses [App Bridge](/docs/api/app-bridge-library) to enable apps to embed themselves in the Shopify Admin.' +
    "\n\nIn this page we'll go over the main components you need to integrate an app with Shopify.",
  sections: [
    {
      type: 'Generic',
      anchorLink: 'quick-start',
      title: 'Quick start',
      sectionContent:
        "The quickest way to create a new app is using the Shopify CLI. You can use your preferred package manager for that." +
        "\n\nCheck out the [getting started guide](/docs/apps/getting-started), or the [app template](https://github.com/Shopify/shopify-app-template-remix) for a complete example.",
      codeblock: {
        title: 'Create an app',
        tabs: [
          {
            title: 'npm',
            language: 'sh',
            code: './examples/index/create.npm.example.sh',
          },
          {
            title: 'yarn',
            language: 'sh',
            code: './examples/index/create.yarn.example.sh',
          },
          {
            title: 'pnpm',
            language: 'sh',
            code: './examples/index/create.pnpm.example.sh',
          },
        ],
      },
      sectionCard: [
        {
          name: 'Build an app',
          subtitle: 'Navigate to',
          url: '/docs/apps/getting-started/build-qr-code-app',
          type: 'tutorial',
        },
      ],
    },
    {
      type: 'Generic',
      anchorLink: 'installation',
      title: 'Installation',
      sectionContent:
        "If you're not using the CLI, then you can use the examples in this page to set up an existing app to use this package. Start by installing it using your preferred package manager.",
      codeblock: {
        title: 'Install package',
        tabs: [
          {
            title: 'npm',
            language: 'sh',
            code: './examples/index/install.npm.example.sh',
          },
          {
            title: 'yarn',
            language: 'sh',
            code: './examples/index/install.yarn.example.sh',
          },
          {
            title: 'pnpm',
            language: 'sh',
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
        "Using the `shopifyApp` function, you can create an object that enables your app's backend to authenticate requests coming from Shopify, and interacting with Shopify APIs." +
        "\n\nThese functions make it easy for your app stays up to date, benefitting from the current best practices and security updates." +
        "\n\n> Caution: When running on a node environment, you'll also need to import the node adapter, as per the example. This will ensure your app is using the appropriate implementation of the Web [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) and [crypto](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) APIs.",
      sectionCard: [
        {
          name: 'shopifyApp',
          url: '/docs/api/shopify-app-remix/entrypoints/shopifyapp',
          type: 'clicode',
        },
      ],
      codeblock: {
        title: 'Configure ShopifyApp',
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
        title: 'Add required headers',
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
        "The OAuth process can't happen inside the admin iframe, and this package is capable of detecting that scenario and properly redirecting using the [Remix `ErrorBoundary`](https://remix.run/docs/en/main/guides/errors) export to set the correct headers for App Bridge." +
        "\n\nUse the abstractions provided by this package in your authenticated routes, to automatically set up the error and headers boundaries to redirect outside the iframe when needed." +
        "\n\n> Tip: You can also add this to a [Remix layout](https://remix.run/docs/en/main/file-conventions/route-files-v2) if you want to authenticate more than one route, but make sure to call the Shopify boundary methods whenever you need to add your own exports.",
      codeblock: {
        title: 'Configure header boundaries',
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
        title: 'Add OAuth route',
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
          url: '/docs/api/shopify-app-remix/entrypoints/appprovider',
          type: 'clicode',
        },
      ],
      codeblock: {
        title: 'Add AppProvider',
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
