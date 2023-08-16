import {LandingTemplateSchema} from '@shopify/generate-docs';

const data: LandingTemplateSchema = {
  id: 'shopify-app-remix',
  title: 'Shopify App package for Remix',
  description:
    'The @shopify/shopify-app-remix package enables Remix apps to authenticate with Shopify and make API calls. It uses [App Bridge](/docs/api/app-bridge-library) to enable apps to embed themselves in the Shopify Admin.',
  sections: [
    {
      type: 'Generic',
      anchorLink: 'setup',
      title: 'Setup',
      sectionContent:
        '1. Run one of the example commands to install the package.\n1. To learn more about using the package, see the Build an app Guide.',
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
      anchorLink: 'authentication',
      title: 'Authentication',
      sectionContent:
        'The Remix app package will handle authenticating requests coming from Shopify. It can validate requests coming from Shopify Admin, webhooks or checkout extensions.\n\nFor more information, see the guides below.',
      sectionCard: [
        // {
        //   name: 'Authenticating requests',
        //   subtitle: 'Navigate to',
        //   url: '/docs/api/shopify-app-remix/authentication',
        //   type: 'tutorial',
        // },
        // {
        //   name: 'Handling webhooks',
        //   subtitle: 'Navigate to',
        //   url: '/docs/api/shopify-app-remix/webhooks',
        //   type: 'tutorial',
        // },
      ],
      codeblock: {
        title: 'Authentication',
        tabs: [
          {
            title: 'Admin',
            language: 'ts',
            code: './examples/index/auth.admin.example.ts',
          },
          {
            title: 'Webhooks',
            language: 'ts',
            code: './examples/index/auth.webhooks.example.ts',
          },
          {
            title: 'Checkout',
            language: 'ts',
            code: './examples/index/auth.checkout.example.ts',
          },
        ],
      },
    },
    {
      type: 'Resource',
      anchorLink: 'shopifyApp',
      title: 'Resources',
      resources: [
        {
          name: 'Reference',
          subtitle: 'Start integrating your app with Shopify.',
          url: '/docs/api/shopify-app-remix/entrypoints',
          type: 'clicode',
        },
        {
          name: 'App bridge',
          subtitle: 'Learn more about App Bridge.',
          url: '/docs/api/app-bridge-library',
          type: 'shopify',
        },
      ],
    },
  ],
};

export default data;
