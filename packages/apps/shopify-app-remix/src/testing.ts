import {restResources} from '@shopify/shopify-api/rest/admin/2023-04';
import {MemorySessionStorage} from '@shopify/shopify-app-session-storage-memory';
import {Session} from '@shopify/shopify-api';

import {
  DeliveryMethod,
  LogSeverity,
  shopifyApp,
  appConfig,
  type AdminApiContextFromConfig,
  AdminApiContext,
} from './server';

const config = appConfig({
  apiKey: 'KEY',
  apiSecretKey: 'SECRET',
  appUrl: 'URL',
  authPathPrefix: '/auth',
  sessionStorage: new MemorySessionStorage(),
  isEmbeddedApp: true,
  future: {
    unstable_newEmbeddedAuthStrategy: true,
  },
  restResources,
  logger: {
    level: LogSeverity.Debug,
  },
  webhooks: {
    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: '/webhooks',
    },
  },
});

const shopify = shopifyApp(config);

// clients can define a type like this in their app, specific to their config
export type AppSpecificAdminApiContext = AdminApiContextFromConfig<
  typeof config
>;

// rest resources are typed based on the config due to app-specific context type
export function doQuery(admin: AppSpecificAdminApiContext) {
  admin.rest.resources.Product.derp();
}

// clients can reference and extend the context type with additional properties
export type AppSpecificAdminApiContextExtended = AdminApiContextFromConfig<
  typeof config
> & {
  additionalProp: string;
};

export function shopifyAdminExtended<T extends AdminApiContext>(admin: T) {
  return {
    ...admin,
    additionalProp: 'value',
  };
}

export const unauthenticatedAdmin = async (shop: string) => {
  const adminResult = await shopify.unauthenticated.admin(shop);
  return {
    ...adminResult,
    admin: shopifyAdminExtended(adminResult.admin),
  };
};

// rest resources are still typed based on the config due to app-specific extended context type
export function doQueryExtended(
  admin: AppSpecificAdminApiContextExtended,
  session: Session,
) {
  admin.rest.resources.Product.derp();
  admin.rest.resources.Product.all({session});
}

export async function authAndQuery(shop: string) {
  const {admin, session} = await unauthenticatedAdmin(shop);
  doQueryExtended(admin, session);
}
