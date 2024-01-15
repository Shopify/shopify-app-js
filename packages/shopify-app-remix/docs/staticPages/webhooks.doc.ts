import {LandingTemplateSchema} from '@shopify/generate-docs';

const data: LandingTemplateSchema = {
  id: 'guide-webhooks',
  title: 'Subscribing to webhooks',
  description:
    'Your app must respond to [mandatory webhook topics](/docs/apps/webhooks/configuration/mandatory-webhooks). In addition, your app can register [optional webhook topics](/docs/api/admin-rest/current/resources/webhook#event-topics).',
  sections: [
    {
      type: 'Generic',
      anchorLink: 'config',
      title: 'Configuring webhooks subscriptions',
      sectionContent:
        'Configure `shopifyApp` and setup webhook subscription with the following steps:' +
        '\n1. The webhooks you want to subscribe to. In this example we subscribe to the `APP_UNINSTALLED` topic.' +
        '\n1. The code to register the `APP_UNINSTALLED` topic after a merchant installs you app. Here `shopifyApp` provides an `afterAuth` hook.' +
        '\n1. Review the required scopes for the webhook topics, and update your [app scopes](/docs/apps/tools/cli/configuration#access_scopes)  as necessary.' +
        "\n\n> Note: You can't register mandatory topics using this package, you must [configure those in the Partner Dashboard](/docs/apps/webhooks/configuration/mandatory-webhooks) instead.",
      codeblock: {
        title: 'Configure webhooks subscriptions',
        tabs: [
          {
            title: '/app/shopify.server.ts',
            code: './examples/guides/webhooks/config.example.ts',
            language: 'tsx',
          },
        ],
      },
    },
    {
      type: 'Generic',
      anchorLink: 'endpoints',
      title: 'Set up your endpoints',
      sectionContent:
        'Create a route in your app to handle incoming webhook requests for each `callbackUrl` you set in your configuration.' +
        'Legitimate webhook requests are always `POST` requests signed by Shopify, so you must authenticate them before taking any action. To do this you must set up an `action` that uses the `authenticate.webhook` function to authenticate the request.' +
        '\n\nPlease keep in mind that webhook endpoints should respond as quickly as possible. If you need to run a long-running job, then consider using background tasks.' +
        '\n\n> Caution: Webhook endpoints **must** respond with an `HTTP 200` code, or Shopify will retry.',
      codeblock: {
        title: 'Receive webhook requests',
        tabs: [
          {
            title: '/app/routes/webhooks.tsx',
            code: './examples/guides/webhooks/endpoint.example.ts',
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
          name: 'authenticate.webhook',
          url: '/docs/api/shopify-app-remix/authenticate/webhook',
        },
      ],
    },
  ],
};

export default data;
