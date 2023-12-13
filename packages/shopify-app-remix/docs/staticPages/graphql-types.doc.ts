import {LandingTemplateSchema} from '@shopify/generate-docs';

const data: LandingTemplateSchema = {
  id: 'guide-graphql-types',
  title: 'Typing GraphQL operations',
  description:
    'The GraphQL clients provided in this package can use [Codegen](https://the-guild.dev/graphql/codegen) to automatically parse and create types for your queries and mutations.' +
    '\n\nBy installing a few packages in your app, you can use the `graphql-codegen` script, which will look for strings with the `#graphql` tag and extract types from them.' +
    '\n\nIf your IDE supports it, you will also get syntax highlighting and auto-complete features when writing your queries.',
  sections: [
    {
      type: 'Markdown',
      anchorLink: 'example',
      title: 'See it in action',
      sectionContent: `
In this example, we use the \`graphql-codegen\` script to parse a query in the \`/app/routes/new.tsx\` file.

Note how VSCode shows the types for both the return type of \`response.json()\`, and the \`variables\` option in the \`graphql\` function.

<video style="width: 100%; height: auto;" muted controls aria-label="A demonstration of a Remix app using GraphQL types">
  <source src="/assets/client-libraries/graphql-types-demo.webm" type="video/webm">
  Your browser doesn't support this video.
</video>
      `,
    },
    {
      type: 'Generic',
      anchorLink: 'install',
      title: 'Installing packages',
      sectionContent:
        'To use the `graphql-codegen` script, you will need to install a few packages in your app.' +
        '\n\nThey will include the scripts to run, and the types that will be overridden by the results of parsing your operations.',
      codeblock: {
        title: 'Installing packages',
        tabs: [
          {
            title: 'npm',
            language: 'sh',
            code: './examples/guides/graphql-types/install.npm.example.sh',
          },
          {
            title: 'yarn',
            language: 'sh',
            code: './examples/guides/graphql-types/install.yarn.example.sh',
          },
          {
            title: 'pnpm',
            language: 'sh',
            code: './examples/guides/graphql-types/install.pnpm.example.sh',
          },
        ],
      },
    },
    {
      type: 'Generic',
      anchorLink: 'configure',
      title: 'Setting up .graphqlrc.ts',
      sectionContent:
        "Before you can parse operations, you'll need to create a `.graphqlrc.ts` file in your project, and configure it to use the `@shopify/api-codegen-preset`." +
        '\n\n> Caution: Parsing will not work on `.graphql` documents, because the preset can only apply types from JavaScript and TypeScript const strings.',
      codeblock: {
        title: 'Codegen configuration example',
        tabs: [
          {
            title: '/.graphqlrc.ts',
            language: 'ts',
            code: './examples/guides/graphql-types/.graphqlrc.ts',
          },
        ],
      },
      sectionCard: [
        {
          url: 'https://github.com/Shopify/shopify-api-js/tree/main/packages/api-codegen-preset#configuration',
          name: 'Configuration options',
          subtitle: 'Learn more about the available configurations.',
          type: 'github',
        },
      ],
    },
    {
      type: 'Generic',
      anchorLink: 'set-up-script',
      title: 'Setting up the script',
      sectionContent:
        'To generate types, you\'ll need to add an entry for `graphql-codegen` in the `"scripts"` section of your `package.json` file.',
      codeblock: {
        title: 'Setting up the script',
        tabs: [
          {
            title: '/package.json',
            language: 'json',
            code: './examples/guides/graphql-types/package.json',
          },
        ],
      },
    },
    {
      type: 'Generic',
      anchorLink: 'run',
      title: 'Generating types',
      sectionContent:
        'When you run `graphql-codegen`, it will look in all your configured documents for strings marked with a `#graphql` tag.' +
        '\n\nIDEs that support the `.graphqlrc.ts` file will provide syntax highlighting for your operations, as well as typing.' +
        '\n\n> Tip: You can pass in a `--watch` flag to the script, which will update your types every time you save a file.',
      codeblock: {
        title: 'Running graphql-codegen',
        tabs: [
          {
            title: 'npm',
            language: 'sh',
            code: './examples/guides/graphql-types/run.npm.example.sh',
          },
          {
            title: 'yarn',
            language: 'sh',
            code: './examples/guides/graphql-types/run.yarn.example.sh',
          },
          {
            title: 'pnpm',
            language: 'sh',
            code: './examples/guides/graphql-types/run.pnpm.example.sh',
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
          name: 'Admin API',
          url: '/docs/api/shopify-app-remix/apis/admin-api',
          type: 'shopify',
          subtitle: 'Make requests to the Admin API',
        },
        {
          name: 'Storefront API',
          url: '/docs/api/shopify-app-remix/apis/storefront-api',
          type: 'shopify',
          subtitle: 'Make requests to the Storefront API',
        },
      ],
    },
  ],
};

export default data;
