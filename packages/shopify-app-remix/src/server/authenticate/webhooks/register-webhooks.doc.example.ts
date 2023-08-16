import {shopifyApp} from '@shopify/shopify-app-remix';

export const shopify = shopifyApp({
  webhooks: {
    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: '/webhooks',
    },
  },
  hooks: {
    afterAuth: async ({session}) => {
      // Register the configured webhooks when the app is installed
      shopify.registerWebhooks({session});
    },
  },
  // ...
});
