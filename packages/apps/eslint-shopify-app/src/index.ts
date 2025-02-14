import {rule as headersExport} from './rules/headers-export';

const plugin = {
  meta: {
    name: 'shopify-app',
  },
  rules: {
    'headers-export': headersExport,
  },
  configs: {
    recommended: {
      plugins: {
        'shopify-app': {
          rules: {
            'headers-export': headersExport,
          },
        },
      },
      rules: {
        'shopify-app/headers-export': 'error',
      },
    },
  },
};

export default plugin;
