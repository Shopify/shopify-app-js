import {LandingTemplateSchema} from '@shopify/generate-docs';

const data: LandingTemplateSchema = {
  id: 'guide-future-flags',
  title: 'Future flags',
  description:
    'Similarly to how [Remix approaches breaking changes](https://remix.run/docs/en/main/start/future-flags), the `@shopify/shopify-app-remix` package also uses future flags.' +
    "\n\nBigger features and breaking changes are initially added behind a future flag. This means that they're disabled by default, and must be manually enabled by setting the appropriate flag in the `future` option of the `shopifyApp` function." +
    '\n\nThis allows apps to gradually adopt new features, and prepare for breaking changes and major releases ahead of time.',
  sections: [
    {
      type: 'Generic',
      anchorLink: 'configuration',
      title: 'Setting future flags',
      sectionContent:
        'To opt in to a feature, simply enable the appropriate flag in the `future` option of the `shopifyApp` function.' +
        '\n\nOnce a flag is set, the returned `shopify` object will start using the new APIs, including using any new types. That allows apps to rely on TypeScript to use a feature regardless of a flag being enabled or not.',
      codeblock: {
        title: 'Enable future flags',
        tabs: [
          {
            title: '/app/shopify.server.ts',
            language: 'ts',
            code: './examples/guides/future-flags/config.example.ts',
          },
        ],
      },
    },
    {
      type: 'Generic',
      anchorLink: 'unstable-apis',
      title: 'Unstable APIs',
      sectionContent:
        'When introducing new features to the package for which we want to gather feedback, we will add them behind a future flag, starting with the `unstable_` prefix.' +
        '\n\nThat allows early adopters to try them out individually, without having to install a release candidate package.' +
        '\n\nWhen the feature is ready for release, the future flag will be removed and it will be available by default.' +
        '\n\nIn this example, `shopify` has a new function called `newFeature`. If the future flag is disabled, TypeScript will be unaware of the new function, and the app will fail to compile if it tries to use it.',
      codeblock: {
        title: 'Use unstable APIs',
        tabs: [
          {
            title: '/app/routes/*.tsx',
            language: 'ts',
            code: './examples/guides/future-flags/unstable.example.ts',
          },
        ],
      },
    },
    {
      type: 'Generic',
      anchorLink: 'breaking-changes',
      title: 'Breaking changes',
      sectionContent:
        'Similarly to unstable APIs, breaking changes will be introduced behind a future flag.' +
        '\n\nThis allows apps to prepare for the next major version ahead of time, and to gradually adopt the new APIs.' +
        '\n\nWhen the next major version is released, the future flag will be removed, and the old code it changes will be removed. Apps that adopted the flag before then will continue to work the same way with no new changes.',
    },
    {
      type: 'GenericList',
      anchorLink: 'flags',
      title: 'Supported flags',
      sectionContent:
        'These are the future flags supported in the current version.',
      listItems: [
        {
          name: 'unstable_newEmbeddedAuthStrategy',
          value: '',
          description:
            'Embedded apps will fetch access tokens via token exchange. This assumes the app has declared scopes for Shopify managed installations.' +
            '\n\nLearn more about this [new embedded app auth strategy](https://shopify.dev/docs/api/shopify-app-remix#embedded-auth-strategy).',
          isOptional: true,
        },
        {
          name: 'removeRest',
          value: '',
          description:
            'Methods for interacting with the admin REST API will not be returned\n\n' +
            'This affects:\n\n' +
            '* `authenticate.admin(request)`\n' +
            '* `authenticate.webhook(request)`\n' +
            '* `authenticate.flow(request)`\n' +
            '* `authenticate.appProxy(request)`\n' +
            '* `authenticate.fulfillmentService(request)`\n' +
            '* `unauthenticated.admin(shop)`\n\n' +
            'Learn more about this change by reading [all-in on graphql](https://www.shopify.com/ca/partners/blog/all-in-on-graphql).',
          isOptional: true,
        },
      ],
    },
  ],
};

export default data;
