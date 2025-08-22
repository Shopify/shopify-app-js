import {
  ConfigParams as ApiConfigArg,
  ConfigInterface as ApiConfig,
  Session,
  ApiVersion,
  WebhookHandler,
} from '@shopify/shopify-api';
import {SessionStorage} from '@shopify/shopify-app-session-storage';
import type {
  BillingConfigOneTimePlan,
  BillingConfigSubscriptionLineItemPlan,
} from '@shopify/shopify-api';

import type {
  ApiFutureFlags,
  FutureFlagOptions,
  FutureFlags,
} from './future/flags';
import type {AppDistribution} from './types';
import type {AdminApiContext} from './clients';
import {IdempotentPromiseHandler} from './authenticate/helpers/idempotent-promise-handler';

export interface BillingConfigWithLineItems {
  [plan: string]:
    | BillingConfigOneTimePlan
    | BillingConfigSubscriptionLineItemPlan;
}

export interface AppConfigArg<
  Storage extends SessionStorage = SessionStorage,
  Future extends FutureFlagOptions = FutureFlagOptions,
> extends Omit<
    ApiConfigArg<ApiFutureFlags<Future>>,
    | 'hostName'
    | 'hostScheme'
    | 'apiVersion'
    | 'isCustomStoreApp'
    | 'isEmbeddedApp'
    | 'future'
    | 'billing'
    | 'restResources'
  > {
  /**
   * The URL your app is running on.
   *
   * The `@shopify/cli` provides this URL as `process.env.SHOPIFY_APP_URL`.  For development this is probably a tunnel URL that points to your local machine.  If this is a production app, this is your production URL.
   */
  appUrl: string;

  /**
   * An adaptor for storing sessions in your database of choice.
   *
   * Shopify provides multiple session storage adaptors and you can create your own.
   *
   * Optional for apps created in the Shopify Admin.
   *
   * {@link https://github.com/Shopify/shopify-app-js/blob/main/README.md#session-storage-options}
   *
   * @example
   * <caption>Storing sessions with Prisma.</caption>
   * <description>Add the `@shopify/shopify-app-session-storage-prisma` package to use the Prisma session storage.</description>
   * ```ts
   * import { shopifyApp } from "@shopify/shopify-app-react-router/server";
   * import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
   *
   * import prisma from "~/db.server";
   *
   * const shopify = shopifyApp({
   *   // ... etc
   *   sessionStorage: new PrismaSessionStorage(prisma),
   * });
   * export default shopify;
   * ```
   */
  sessionStorage?: Storage;

  /**
   * Billing configurations for the app.
   *
   * Uses the new line item billing format that allows for more complex billing structures.
   *
   * @example
   * ```ts
   * import { BillingInterval } from "@shopify/shopify-api";
   *
   * billing: {
   *   myPlan: {
   *     lineItems: [
   *       {
   *         amount: 10,
   *         currencyCode: 'USD',
   *         interval: BillingInterval.Every30Days,
   *       }
   *     ],
   *   },
   * }
   * ```
   */
  billing?: BillingConfigWithLineItems;

  /**
   * Whether your app use online or offline tokens.
   *
   * If your app uses online tokens, then both online and offline tokens will be saved to your database.  This ensures your app can perform background jobs.
   *
   * {@link https://shopify.dev/docs/apps/auth/oauth/access-modes}
   *
   * @defaultValue `false`
   */
  useOnlineTokens?: boolean;

  /**
   * The config for the shop-specific webhooks your app needs.
   * 
   * Use this to configure shop-specific webhooks. In many cases defining app-specific webhooks in the `shopify.app.toml` will be sufficient and easier to manage.  Please see:
   * 
   * {@link https://shopify.dev/docs/apps/build/webhooks/subscribe#app-specific-vs-shop-specific-subscriptions}
   * 
   * You should only use this if you need shop-specific webhooks. If you do need shop-specific webhooks this can be in used in conjunction with the afterAuth hook, loaders or processes such as background jobs.
   *
   * @example
   * <caption>Registering shop-specific webhooks.</caption>
   * ```ts
   * // app/shopify.server.ts
   * import { DeliveryMethod, shopifyApp } from "@shopify/shopify-app-react-router/server";
   *
   * const shopify = shopifyApp({
   *   webhooks: {
   *     PRODUCTS_CREATE: {
   *       deliveryMethod: DeliveryMethod.Http,
   *        callbackUrl: "/webhooks/products/create",
   *     },
   *   },
   *   hooks: {
   *     afterAuth: async ({ session }) => {
   *       // Register webhooks for the shop
   *       // In this example, every shop will have these webhooks
   *       // But you could wrap this in some custom shop specific conditional logic
   *       shopify.registerWebhooks({ session });
   *     }
   *   },
   *   // ...etc
   * });
   * export default shopify;
   * export const authenticate = shopify.authenticate;
   * ```
   * 
   * @example
   * <caption>Registering app-specific webhooks (Recommended)</caption>
   * ```toml
   * # shopify.app.toml
   * [webhooks]
   * api_version = "2024-07"

   *   [[webhooks.subscriptions]]
   *   topics = ["products/create"]
   *   uri = "/webhooks/products/create"
   * 
   * ```
   * 
   * @example
   * <caption>Authenticating a webhook request</caption>
   *
   * ```ts
   * // /app/routes/webhooks.ts
   * import { ActionFunctionArgs } from "react-router";
   * import { authenticate } from "../shopify.server";
   * import db from "../db.server";
   *
   * export const action = async ({ request }: ActionFunctionArgs) => {
   *   const { topic, shop, session, payload } = await authenticate.webhook(request);
   * 
   *   // Webhook requests can trigger after an app is uninstalled
   *   // If the app is already uninstalled, the session may be undefined.
   *   if (!session) {
   *     throw new Response();
   *   }
   * 
   *   // Handle the webhook
   *   console.log(`${TOPIC} webhook received with`, JSON.stringify(payload))
   *
   *   throw new Response();
   * };
   * ```
   */
  webhooks?: WebhookConfig;

  /**
   * Functions to call at key places during your apps lifecycle.
   *
   * These functions are called in the context of the request that triggered them.  This means you can access the session.
   *
   * @example
   * <caption>Seeding your database custom data when a merchant installs your app.</caption>
   * ```ts
   * import { DeliveryMethod, shopifyApp } from "@shopify/shopify-app-react-router/server";
   * import { seedStoreData } from "~/db/seeds"
   *
   * const shopify = shopifyApp({
   *   hooks: {
   *     afterAuth: async ({ session }) => {
   *       seedStoreData({session})
   *     }
   *   },
   *   // ...etc
   * });
   * ```
   */
  hooks?: HooksConfig;

  /**
   * How your app is distributed. Default is `AppDistribution.AppStore`.
   *
   * AppStore should be used for public apps that are distributed in the Shopify App Store.
   * SingleMerchant should be used for custom apps managed in the Partner Dashboard.
   * ShopifyAdmin should be used for apps that are managed in the merchant's Shopify Admin.
   *
   * {@link https://shopify.dev/docs/apps/distribution}
   */
  distribution?: AppDistribution;

  /**
   * What version of Shopify's Admin API's would you like to use.
   *
   * {@link https://shopify.dev/docs/api/}
   *
   * @defaultValue `LATEST_API_VERSION` from `@shopify/shopify-app-react-router`
   *
   * @example
   * <caption>Using the latest API Version (Recommended)</caption>
   * ```ts
   * import { LATEST_API_VERSION, shopifyApp } from "@shopify/shopify-app-react-router/server";
   *
   * const shopify = shopifyApp({
   *   // ...etc
   *   apiVersion: LATEST_API_VERSION,
   * });
   * ```
   */
  apiVersion?: ApiVersion;

  /**
   * A path that Shopify can reserve for auth related endpoints.
   *
   * This must match a $ route in your React Router app.  That route must export a loader function that calls `shopify.authenticate.admin(request)`.
   *
   * @default `"/auth"`
   *
   * @example
   * <caption>Using the latest API Version (Recommended)</caption>
   * ```ts
   * // /app/shopify.server.ts
   * import { LATEST_API_VERSION, shopifyApp } from "@shopify/shopify-app-react-router/server";
   *
   * const shopify = shopifyApp({
   *   // ...etc
   *   apiVersion: LATEST_API_VERSION,
   * });
   * export default shopify;
   * export const authenticate = shopify.authenticate;
   *
   * // /app/routes/auth/$.jsx
   * import { LoaderFunctionArgs } from "react-router";
   * import { authenticate } from "../../shopify.server";
   *
   * export async function loader({ request }: LoaderFunctionArgs) {
   *   await authenticate.admin(request);
   *
   *   return null
   * }
   * ```
   */
  authPathPrefix?: string;

  /**
   * Features that will be introduced in future releases of this package.
   *
   * You can opt in to these features by setting the corresponding flags. By doing so, you can prepare for future
   * releases in advance and provide feedback on the new features.
   */
  future?: Future;
}

export interface AppConfig<Storage extends SessionStorage = SessionStorage>
  extends Omit<ApiConfig, 'future' | 'billing'> {
  canUseLoginForm: boolean;
  appUrl: string;
  auth: AuthConfig;
  sessionStorage?: Storage;
  useOnlineTokens: boolean;
  hooks: HooksConfig;
  future: FutureFlags;
  idempotentPromiseHandler: IdempotentPromiseHandler;
  distribution: AppDistribution;
  billing?: BillingConfigWithLineItems;
}

export interface AuthConfig {
  path: string;
  callbackPath: string;
  exitIframePath: string;
  patchSessionTokenPath: string;
  loginPath: string;
}

export type WebhookConfig = Record<string, WebhookHandler | WebhookHandler[]>;

interface HooksConfig {
  /**
   * A function to call after a merchant installs your app
   *
   * @param context - An object with context about the request that triggered the hook.
   * @param context.session - The session of the merchant that installed your app. This is the output of sessionStorage.loadSession in case people want to load their own.
   * @param context.admin - An object with access to the Shopify Admin API's.
   *
   * @example
   * <caption>Seeding data when a merchant installs your app.</caption>
   * ```ts
   * import { DeliveryMethod, shopifyApp } from "@shopify/shopify-app-react-router/server";
   * import { seedStoreData } from "~/db/seeds"
   *
   * const shopify = shopifyApp({
   *   hooks: {
   *     afterAuth: async ({ session }) => {
   *       seedStoreData({session})
   *     }
   *   },
   *   // ...etc
   * });
   * ```
   */
  afterAuth?: (options: AfterAuthOptions) => void | Promise<void>;
}

export interface AfterAuthOptions {
  session: Session;
  admin: AdminApiContext;
}
