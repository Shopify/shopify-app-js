import {LandingTemplateSchema} from '@shopify/generate-docs';

const data: LandingTemplateSchema = {
  id: 'guide-billing',
  title: 'Billing for your app',
  description:
    'You can bill merchants for your app via Shopify using the Admin API, either as a one-time purchase or as a recurring subscription.' +
    '\n\nShopify will handle the transactions, based on purchases set up by the app and agreed upon by the merchant.' +
    '\n\nFor more information on how this process works, see [the billing documentation](/docs/apps/billing).',
  sections: [
    {
      type: 'Generic',
      anchorLink: 'app-purchases',
      title: 'Setting up app purchases',
      sectionContent:
        'Your app can offer one or more billing options to merchants. These can be one-time purchases or recurring subscriptions.' +
        '\n\nTo configure app purchases, use the `billing` configuration when calling `shopifyApp`. This configuration is a hash, where the keys are the purchase name that will appear in the purchase, and the values are the settings.' +
        '\n\nEach configuration must contain an `amount`, `currencyCode` and `interval`, but they also accept the same parameters as the GraphQL mutations below.',
      sectionCard: [
        {
          name: 'appSubscriptionCreate',
          url: '/docs/api/admin-graphql/current/mutations/appSubscriptionCreate',
          type: 'shopify',
        },
        {
          name: 'appPurchaseOneTimeCreate',
          url: '/docs/api/admin-graphql/current/mutations/appPurchaseOneTimeCreate',
          type: 'shopify',
        },
      ],
      codeblock: {
        title: '/app/routes/**/*.tsx',
        tabs: [
          {
            title: '/app/routes/**/*.tsx',
            code: './examples/guides/billing/config.example.tsx',
            language: 'tsx',
          },
        ],
      },
    },
    {
      type: 'Generic',
      anchorLink: 'require',
      title: 'Gating requests',
      sectionContent:
        'You can ensure that merchants have paid for the app before allowing them to access certain routes.' +
        "\n\nTo do this, you can use the `admin.billing.require` function. This function will verify that there is an active payment, or require it if there isn't." +
        '\n\nYou can pass in multiple plans to `require`. It will pass if there is a purchase for **any** of them, and return information on the active purchase.' +
        "\n\n> Tip: Make sure to call this function in both loaders and actions so you don't end up with ungated requests.\n> If you want to gate multiple routes, use this example in a [Remix layout](https://remix.run/docs/en/main/file-conventions/route-files-v2).",
      codeblock: {
        title: '/app/routes/**/*.tsx',
        tabs: [
          {
            title: '/app/routes/**/*.tsx',
            code: './examples/guides/billing/require.example.tsx',
            language: 'tsx',
          },
        ],
      },
    },
    {
      type: 'Generic',
      anchorLink: 'request',
      title: 'Requesting payment',
      sectionContent:
        "If `admin.billing.require` doesn't find a purchase, it will trigger the `onFailure` callback." +
        '\n\nWhen that happens, you can decide where to take the merchant, which may typically mean:' +
        '\n- Request payment right away for one of the purchase configs' +
        '\n- Redirect the merchant to page where they can select a plan' +
        "\n\n> Tip: You'll still need to call `authenticate.admin` in the plan selection page so you have access to the Admin API.",
      codeblock: {
        title: '/app/routes/**/*.tsx',
        tabs: [
          {
            title: 'Request billing right away',
            code: './examples/guides/billing/request.example.tsx',
            language: 'tsx',
          },
          {
            title: 'Redirect merchant',
            code: './examples/guides/billing/request-redirect.example.tsx',
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
          name: 'admin.billing',
          url: '../backend/admin-features/billing',
        },
      ],
    },
  ],
};

export default data;
