import {
  RegisterReturn,
  Shopify,
  ShopifyRestResources,
} from '@shopify/shopify-api';
import {SessionStorage} from '@shopify/shopify-app-session-storage';

import type {AppConfig, AppConfigArg} from './config-types';
import type {
  AuthenticateWebhook,
  RegisterWebhooksOptions,
} from './authenticate/webhooks/types';
import type {AuthenticatePublic} from './authenticate/public/types';
import type {AuthenticateAdmin} from './authenticate/admin/types';
import type {Unauthenticated} from './unauthenticated/types';
import type {AuthenticateFlow} from './authenticate/flow/types';
import type {
  ApiConfigWithFutureFlags,
  ApiFutureFlags,
  FutureFlagOptions,
} from './future/flags';
import {AuthenticateFulfillmentService} from './authenticate/fulfillment-service/types';

export interface BasicParams<
  Future extends FutureFlagOptions = FutureFlagOptions,
> {
  api: Shopify<
    ApiConfigWithFutureFlags<Future>,
    ShopifyRestResources,
    ApiFutureFlags<Future>
  >;
  config: AppConfig;
  logger: Shopify['logger'];
}

// eslint-disable-next-line no-warning-comments
// TODO: Use this enum to replace the isCustomStoreApp config option in shopify-api-js
export enum AppDistribution {
  AppStore = 'app_store',
  SingleMerchant = 'single_merchant',
  ShopifyAdmin = 'shopify_admin',
}

type RegisterWebhooks = (
  options: RegisterWebhooksOptions,
) => Promise<RegisterReturn | void>;

export enum LoginErrorType {
  MissingShop = 'MISSING_SHOP',
  InvalidShop = 'INVALID_SHOP',
}

export interface LoginError {
  shop?: LoginErrorType;
}

type Login = (request: Request) => Promise<LoginError | never>;

type AddDocumentResponseHeaders = (request: Request, headers: Headers) => void;

type RestResourcesType<Config extends AppConfigArg> =
  Config['restResources'] extends ShopifyRestResources
    ? Config['restResources']
    : ShopifyRestResources;

type SessionStorageType<Config extends AppConfigArg> =
  Config['sessionStorage'] extends SessionStorage
    ? Config['sessionStorage']
    : SessionStorage;

interface Authenticate<Config extends AppConfigArg> {
  /**
   * Authenticate an admin Request and get back an authenticated admin context.  Use the authenticated admin context to interact with Shopify.
   *
   * Examples of when to use this are requests from your app's UI, or requests from admin extensions.
   *
   * If there is no session for the Request, this will redirect the merchant to correct auth flows.
   *
   * @example
   * <caption>Authenticating a request for an embedded app.</caption>
   * ```ts
   * // /app/routes/**\/*.jsx
   * import { LoaderFunctionArgs, json } from "@remix-run/node";
   * import { authenticate } from "../../shopify.server";
   *
   * export async function loader({ request }: LoaderFunctionArgs) {
   *   const {admin, session, sessionToken, billing} = authenticate.admin(request);
   *
   *   return json(await admin.rest.resources.Product.count({ session }));
   * }
   * ```
   * ```ts
   * // /app/shopify.server.ts
   * import { LATEST_API_VERSION, shopifyApp } from "@shopify/shopify-app-remix/server";
   * import { restResources } from "@shopify/shopify-api/rest/admin/2023-04";
   *
   * const shopify = shopifyApp({
   *   restResources,
   *   // ...etc
   * });
   * export default shopify;
   * export const authenticate = shopify.authenticate;
   * ```
   */
  admin: AuthenticateAdmin<Config, RestResourcesType<Config>>;

  /**
   * Authenticate a Flow extension Request and get back an authenticated context, containing an admin context to access
   * the API, and the payload of the request.
   *
   * If there is no session for the Request, this will return an HTTP 400 error.
   *
   * Note that this will always be a POST request.
   *
   * @example
   * <caption>Authenticating a Flow extension request.</caption>
   * ```ts
   * // /app/routes/**\/*.jsx
   * import { ActionFunctionArgs, json } from "@remix-run/node";
   * import { authenticate } from "../../shopify.server";
   *
   * export async function action({ request }: ActionFunctionArgs) {
   *   const {admin, session, payload} = authenticate.flow(request);
   *
   *   // Perform flow extension logic
   *
   *   // Return a 200 response
   *   return null;
   * }
   * ```
   * ```ts
   * // /app/shopify.server.ts
   * import { LATEST_API_VERSION, shopifyApp } from "@shopify/shopify-app-remix/server";
   * import { restResources } from "@shopify/shopify-api/rest/admin/2023-04";
   *
   * const shopify = shopifyApp({
   *   restResources,
   *   // ...etc
   * });
   * export default shopify;
   * export const authenticate = shopify.authenticate;
   * ```
   */
  flow: AuthenticateFlow<RestResourcesType<Config>>;

  /**
   * Authenticate a request from a fulfillment service and get back an authenticated context.
   *
   * @example
   * <caption>Shopify session for the fulfillment service request.</caption>
   * <description>Use the session associated with this request to use the Admin GraphQL API </description>
   * ```ts
   * // /app/routes/fulfillment_order_notification.ts
   * import { ActionFunctionArgs } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   *
   * export async function action({ request }: ActionFunctionArgs) {
   *   const { admin } = await authenticate.fulfillmentService(request);
   *
   *   const response = await admin.graphql(
   *     `#graphql
   *     mutation acceptFulfillmentRequest {
   *       fulfillmentOrderAcceptFulfillmentRequest(
   *            id: "gid://shopify/FulfillmentOrder/5014440902678",
   *            message: "Reminder that tomorrow is a holiday. We won't be able to ship this until Monday."){
   *             fulfillmentOrder {
   *                 status
   *                requestStatus
   *            }
   *         }
   *     }
   *    );
   *
   *   const productData = await response.json();
   *   return json({ data: productData.data });
   * }
   * ```
   * */
  fulfillmentService: AuthenticateFulfillmentService<RestResourcesType<Config>>;

  /**
   * Authenticate a public request and get back a session token.
   *
   * @example
   * <caption>Authenticating a request from a checkout extension</caption>
   *
   * ```ts
   * // /app/routes/api/checkout.jsx
   * import { LoaderFunctionArgs, json } from "@remix-run/node";
   * import { authenticate } from "../../shopify.server";
   * import { getWidgets } from "~/db/widgets";
   *
   * export async function loader({ request }: LoaderFunctionArgs) {
   *   const {sessionToken} = authenticate.public.checkout(request);
   *
   *   return json(await getWidgets(sessionToken));
   * }
   * ```
   */
  public: AuthenticatePublic;

  /**
   * Authenticate a Shopify webhook request, get back an authenticated admin context and details on the webhook request
   * 
   * @example
   * <caption>Authenticating a webhook request</caption>
   *
   * ```ts
   * // app/routes/webhooks.ts
   * import { ActionFunctionArgs } from "@remix-run/node";
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
   *   console.log(`${TOPIC} webhook received with payload:`, JSON.stringify(payload))
   *
   *   throw new Response();
   * };
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
   * <caption>Registering shop-specific webhooks.</caption>
   * <description>In many cases you won't need this. Please see: [https://shopify.dev/docs/apps/build/webhooks/subscribe#app-specific-vs-shop-specific-subscriptions](https://shopify.dev/docs/apps/build/webhooks/subscribe#app-specific-vs-shop-specific-subscriptions)
   * </description>
   * ```ts
   * // app/shopify.server.ts
   * import { DeliveryMethod, shopifyApp } from "@shopify/shopify-app-remix/server";
   *
   * const shopify = shopifyApp({
   *   webhooks: {
   *     PRODUCTS_CREATE: {
   *       deliveryMethod: DeliveryMethod.Http,
   *       callbackUrl: "/webhooks/products/create",
   *     },
   *   },
   *   hooks: {
   *     afterAuth: async ({ session }) => {
   *       // Register webhooks for the shop
   *       // In this example, every shop will have these webhooks
   *       // You could wrap this in some custom shop specific conditional logic if needed
   *       shopify.registerWebhooks({ session });
   *     },
   *   },
   *   // ...etc
   * });
   * ```
   */
  webhook: AuthenticateWebhook<RestResourcesType<Config>, string>;
}

export interface ShopifyAppBase<Config extends AppConfigArg> {
  /**
   * The `SessionStorage` instance you passed in as a config option.
   *
   * @example
   * <caption>Storing sessions with Prisma.</caption>
   * <description>Import the `@shopify/shopify-app-session-storage-prisma` package to store sessions in your Prisma database.</description>
   * ```ts
   * // /app/shopify.server.ts
   * import { shopifyApp } from "@shopify/shopify-app-remix/server";
   * import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
   * import prisma from "~/db.server";
   *
   * const shopify = shopifyApp({
   *   sessionStorage: new PrismaSessionStorage(prisma),
   *   // ...etc
   * })
   *
   * // shopify.sessionStorage is an instance of PrismaSessionStorage
   * ```
   */
  sessionStorage?: SessionStorageType<Config>;

  /**
   * Adds the required Content Security Policy headers for Shopify apps to the given Headers object.
   *
   * {@link https://shopify.dev/docs/apps/store/security/iframe-protection}
   *
   * @example
   * <caption>Return headers on all requests.</caption>
   * <description>Add headers to all HTML requests by calling `shopify.addDocumentResponseHeaders` in `entry.server.tsx`.</description>
   *
   * ```
   * // ~/shopify.server.ts
   * import { shopifyApp } from "@shopify/shopify-app-remix/server";
   *
   * const shopify = shopifyApp({
   *   // ...etc
   * });
   * export default shopify;
   * export const addDocumentResponseheaders = shopify.addDocumentResponseheaders;
   * ```
   *
   * ```ts
   * // entry.server.tsx
   * import { addDocumentResponseHeaders } from "~/shopify.server";
   *
   * export default function handleRequest(
   *   request: Request,
   *   responseStatusCode: number,
   *   responseHeaders: Headers,
   *   remixContext: EntryContext
   * ) {
   *   const markup = renderToString(
   *     <RemixServer context={remixContext} url={request.url} />
   *   );
   *
   *   responseHeaders.set("Content-Type", "text/html");
   *   addDocumentResponseHeaders(request, responseHeaders);
   *
   *   return new Response("<!DOCTYPE html>" + markup, {
   *     status: responseStatusCode,
   *     headers: responseHeaders,
   *   });
   * }
   * ```
   */
  addDocumentResponseHeaders: AddDocumentResponseHeaders;

  /**
   * Register shop-specific webhook subscriptions using the Admin GraphQL API.
   *
   * In many cases defining app-specific webhooks in the `shopify.app.toml` will be sufficient and easier to manage.  Please see:
   *
   * {@link https://shopify.dev/docs/apps/build/webhooks/subscribe#app-specific-vs-shop-specific-subscriptions}
   *
   * You should only use this if you need shop-specific webhooks.
   *
   * @example
   * <caption>Registering shop-specific webhooks after install</caption>
   * <description>Trigger the registration to create the shop-specific webhook subscriptions after a merchant installs your app using the `afterAuth` hook. Learn more about [subscribing to webhooks.](https://shopify.dev/docs/api/shopify-app-remix/v3/guide-webhooks)</description>
   * ```ts
   * // app/shopify.server.ts
   * import { DeliveryMethod, shopifyApp } from "@shopify/shopify-app-remix/server";
   *
   * const shopify = shopifyApp({
   *   webhooks: {
   *     PRODUCTS_CREATE: {
   *       deliveryMethod: DeliveryMethod.Http,
   *       callbackUrl: "/webhooks/products/create",
   *     },
   *   },
   *   hooks: {
   *     afterAuth: async ({ session }) => {
   *       // Register webhooks for the shop
   *       // In this example, every shop will have these webhooks
   *       // You could wrap this in some custom shop specific conditional logic if needed
   *       shopify.registerWebhooks({ session });
   *     },
   *   },
   *   // ...etc
   * });
   * ```
   */
  registerWebhooks: RegisterWebhooks;

  /**
   * Ways to authenticate requests from different surfaces across Shopify.
   *
   * @example
   * <caption>Authenticate Shopify requests.</caption>
   * <description>Use the functions in `authenticate` to validate requests coming from Shopify.</description>
   * ```ts
   * // /app/shopify.server.ts
   * import { LATEST_API_VERSION, shopifyApp } from "@shopify/shopify-app-remix/server";
   * import { restResources } from "@shopify/shopify-api/rest/admin/2023-04";
   *
   * const shopify = shopifyApp({
   *   restResources,
   *   // ...etc
   * });
   * export default shopify;
   * ```
   * ```ts
   * // /app/routes/**\/*.jsx
   * import { LoaderFunctionArgs, json } from "@remix-run/node";
   * import shopify from "../../shopify.server";
   *
   * export async function loader({ request }: LoaderFunctionArgs) {
   *   const {admin, session, sessionToken, billing} = shopify.authenticate.admin(request);
   *
   *   return json(await admin.rest.resources.Product.count({ session }));
   * }
   * ```
   */
  authenticate: Authenticate<Config>;

  /**
   * Ways to get Contexts from requests that do not originate from Shopify.
   *
   * @example
   * <caption>Using unauthenticated contexts.</caption>
   * <description>Create contexts for requests that don't come from Shopify.</description>
   * ```ts
   * // /app/shopify.server.ts
   * import { LATEST_API_VERSION, shopifyApp } from "@shopify/shopify-app-remix/server";
   * import { restResources } from "@shopify/shopify-api/rest/admin/2023-04";
   *
   * const shopify = shopifyApp({
   *   restResources,
   *   // ...etc
   * });
   * export default shopify;
   * ```
   * ```ts
   * // /app/routes/**\/*.jsx
   * import { LoaderFunctionArgs, json } from "@remix-run/node";
   * import { authenticateExternal } from "~/helpers/authenticate"
   * import shopify from "../../shopify.server";
   *
   * export async function loader({ request }: LoaderFunctionArgs) {
   *   const shop = await authenticateExternal(request)
   *   const {admin} = await shopify.unauthenticated.admin(shop);
   *
   *   return json(await admin.rest.resources.Product.count({ session }));
   * }
   * ```
   */
  unauthenticated: Unauthenticated<RestResourcesType<Config>>;
}

export interface ShopifyAppLogin {
  /**
   * Log a merchant in, and redirect them to the app root. Will redirect the merchant to authentication if a shop is
   * present in the URL search parameters or form data.
   *
   * This function won't be present when the `distribution` config option is set to `AppDistribution.ShopifyAdmin`,
   * because Admin apps aren't allowed to show a login page.
   *
   * @example
   * <caption>Creating a login page.</caption>
   * <description>Use `shopify.login` to create a login form, in a route that can handle GET and POST requests.</description>
   * ```ts
   * // /app/shopify.server.ts
   * import { LATEST_API_VERSION, shopifyApp } from "@shopify/shopify-app-remix/server";
   *
   * const shopify = shopifyApp({
   *   // ...etc
   * });
   * export default shopify;
   * ```
   * ```ts
   * // /app/routes/auth/login.tsx
   * import shopify from "../../shopify.server";
   *
   * export async function loader({ request }: LoaderFunctionArgs) {
   *   const errors = shopify.login(request);
   *
   *   return json(errors);
   * }
   *
   * export async function action({ request }: ActionFunctionArgs) {
   *   const errors = shopify.login(request);
   *
   *   return json(errors);
   * }
   *
   * export default function Auth() {
   *   const actionData = useActionData<typeof action>();
   *   const [shop, setShop] = useState("");
   *
   *   return (
   *     <Page>
   *       <Card>
   *         <Form method="post">
   *           <FormLayout>
   *             <Text variant="headingMd" as="h2">
   *               Login
   *             </Text>
   *             <TextField
   *               type="text"
   *               name="shop"
   *               label="Shop domain"
   *               helpText="e.g: my-shop-domain.myshopify.com"
   *               value={shop}
   *               onChange={setShop}
   *               autoComplete="on"
   *               error={actionData?.errors.shop}
   *             />
   *             <Button submit primary>
   *               Submit
   *             </Button>
   *           </FormLayout>
   *         </Form>
   *       </Card>
   *     </Page>
   *   );
   * }
   * ```
   */
  login: Login;
}

export type AdminApp<Config extends AppConfigArg> = ShopifyAppBase<Config>;
export type SingleMerchantApp<Config extends AppConfigArg> =
  ShopifyAppBase<Config> & ShopifyAppLogin;
export type AppStoreApp<Config extends AppConfigArg> = ShopifyAppBase<Config> &
  ShopifyAppLogin;

type EnforceSessionStorage<Config extends AppConfigArg, Base> = Base & {
  sessionStorage: SessionStorageType<Config>;
};

/**
 * An object your app can use to interact with Shopify.
 *
 * By default, the app's distribution is `AppStore`.
 */
export type ShopifyApp<Config extends AppConfigArg> =
  Config['distribution'] extends AppDistribution.ShopifyAdmin
    ? AdminApp<Config>
    : Config['distribution'] extends AppDistribution.SingleMerchant
      ? EnforceSessionStorage<Config, SingleMerchantApp<Config>>
      : Config['distribution'] extends AppDistribution.AppStore
        ? EnforceSessionStorage<Config, AppStoreApp<Config>>
        : EnforceSessionStorage<Config, AppStoreApp<Config>>;
