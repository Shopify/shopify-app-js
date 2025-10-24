import {RegisterReturn, Shopify} from '@shopify/shopify-api';
import {SessionStorage} from '@shopify/shopify-app-session-storage';

import type {AuthenticateAdmin} from './authenticate/admin/types';
import type {AuthenticateFlow} from './authenticate/flow/types';
import {AuthenticateFulfillmentService} from './authenticate/fulfillment-service/types';
import type {AuthenticatePublic} from './authenticate/public/types';
import type {
  AuthenticateWebhook,
  RegisterWebhooksOptions,
} from './authenticate/webhooks/types';
import type {AppConfig, AppConfigArg} from './config-types';
import type {
  ApiConfigWithFutureFlags,
  ApiFutureFlags,
  FutureFlagOptions,
} from './future/flags';
import type {Unauthenticated} from './unauthenticated/types';
import type {AuthenticatePOS} from './authenticate/pos/types';
import type {
  AuthMiddlewareOptions,
  BillingRequiredOptions,
} from './middleware/types';
import type {MiddlewareFunction} from 'react-router';

export interface BasicParams<
  Future extends FutureFlagOptions = FutureFlagOptions,
> {
  api: Shopify<ApiConfigWithFutureFlags<Future>, any, ApiFutureFlags<Future>>;
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
   * import { LoaderFunctionArgs, json } from "react-router";
   * import { authenticate } from "../../shopify.server";
   *
   * export async function loader({ request }: LoaderFunctionArgs) {
   *   const {admin, session, sessionToken, billing} = authenticate.admin(request);
   *   const response = await admin.graphql(`{ shop { name } }`)
   *
   *   return (await response.json());
   * }
   * ```
   * ```ts
   * // /app/shopify.server.ts
   * import { ApiVersion, shopifyApp } from "@shopify/shopify-app-react-router/server";
   *
   * const shopify = shopifyApp({
   *   // ...etc
   * });
   * export default shopify;
   * export const authenticate = shopify.authenticate;
   * ```
   */
  admin: AuthenticateAdmin<Config>;

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
   * import { ActionFunctionArgs, json } from "react-router";
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
   * import { ApiVersion, shopifyApp } from "@shopify/shopify-app-react-router/server";
   *
   * const shopify = shopifyApp({
   *   // ...etc
   * });
   * export default shopify;
   * export const authenticate = shopify.authenticate;
   * ```
   */
  flow: AuthenticateFlow;

  /**
   * Authenticate a request from a fulfillment service and get back an authenticated context.
   *
   * @example
   * <caption>Shopify session for the fulfillment service request.</caption>
   * <description>Use the session associated with this request to use the Admin GraphQL API </description>
   * ```ts
   * // /app/routes/fulfillment_order_notification.ts
   * import { ActionFunctionArgs } from "react-router";
   * import { authenticate } from "../shopify.server";
   *
   * export async function action({ request }: ActionFunctionArgs) {
   *   const { admin, session } = await authenticate.fulfillmentService(request);
   *
   *   console.log(session.id)
   *
   *   return new Response();
   * }
   * ```
   * */
  fulfillmentService: AuthenticateFulfillmentService;

  /**
   * Authenticate a request from a POS UI extension
   *
   * @example
   * <caption>Authenticating a POS UI extension request</caption>
   * ```ts
   * // /app/routes/public/widgets.ts
   * import { LoaderFunctionArgs, json } from "react-router";
   * import { authenticate } from "../shopify.server";
   *
   * export const loader = async ({ request }: LoaderFunctionArgs) => {
   *   const { sessionToken, cors } = await authenticate.pos(
   *     request,
   *   );
   *   return cors({my: "data", shop: sessionToken.dest}));
   * };
   * ```
   */
  pos: AuthenticatePOS;

  /**
   * Authenticate a public request and get back a session token.
   *
   * @example
   * <caption>Authenticating a request from a checkout extension</caption>
   *
   * ```ts
   * // /app/routes/api/checkout.jsx
   * import { LoaderFunctionArgs, json } from "react-router";
   * import { authenticate } from "../../shopify.server";
   * import { getWidgets } from "~/db/widgets";
   *
   * export async function loader({ request }: LoaderFunctionArgs) {
   *   const {sessionToken} = authenticate.public.checkout(request);
   *
   *   return (await getWidgets(sessionToken));
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
   * import { DeliveryMethod, shopifyApp } from "@shopify/shopify-app-react-router/server";
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
  webhook: AuthenticateWebhook<string>;
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
   * import { shopifyApp } from "@shopify/shopify-app-react-router/server";
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
   * import { shopifyApp } from "@shopify/shopify-app-react-router/server";
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
   *   reactRouterContext: EntryContext
   * ) {
   *   const markup = renderToString(
   *     <ReactRouterServer context={reactRouterContext} url={request.url} />
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
   * <description>Trigger the registration to create the shop-specific webhook subscriptions after a merchant installs your app using the `afterAuth` hook. Learn more about [subscribing to webhooks.](https://shopify.dev/docs/api/shopify-app-react-router/v3/guide-webhooks)</description>
   * ```ts
   * // app/shopify.server.ts
   * import { DeliveryMethod, shopifyApp } from "@shopify/shopify-app-react-router/server";
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
   * import { ApiVersion, shopifyApp } from "@shopify/shopify-app-react-router/server";
   *
   * const shopify = shopifyApp({
   *   // ...etc
   * });
   * export default shopify;
   * ```
   * ```ts
   * // /app/routes/**\/*.jsx
   * import { LoaderFunctionArgs, json } from "react-router";
   * import shopify from "../../shopify.server";
   *
   * export async function loader({ request }: LoaderFunctionArgs) {
   *   const {admin, session, sessionToken, billing} = shopify.authenticate.admin(request);
   *   const response = admin.graphql(`{ shop { name } }`)
   *
   *   return (await response.json());
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
   * import { ApiVersion, shopifyApp } from "@shopify/shopify-app-react-router/server";
   *
   * const shopify = shopifyApp({
   *   // ...etc
   * });
   * export default shopify;
   * ```
   * ```ts
   * // /app/routes/**\/*.jsx
   * import { LoaderFunctionArgs, json } from "react-router";
   * import { authenticateExternal } from "~/helpers/authenticate"
   * import shopify from "../../shopify.server";
   *
   * export async function loader({ request }: LoaderFunctionArgs) {
   *   const shop = await authenticateExternal(request)
   *   const {admin} = await shopify.unauthenticated.admin(shop);
   *   const response = admin.graphql(`{ shop { currencyCode } }`)
   *
   *   return (await response.json());
   * }
   * ```
   */
  unauthenticated: Unauthenticated;

  /**
   * React Router v7 middleware for authentication and authorization.
   *
   * These middleware functions provide a performant, idiomatic alternative to the authenticate pattern.
   * Authorization checks happen BEFORE loaders run, preventing unnecessary work when requests fail validation.
   *
   * @example
   * <caption>Using middleware for authentication and billing</caption>
   * <description>Compose multiple middleware to protect routes with authentication and billing requirements.</description>
   * ```ts
   * // /app/routes/app.premium.tsx
   * import { LoaderFunctionArgs, json } from "react-router";
   * import shopify from "../shopify.server";
   * import { adminContext } from "@shopify/shopify-app-react-router/server";
   *
   * export const middleware = [
   *   shopify.middleware.withAuthentication(),
   *   shopify.middleware.withBillingRequired({
   *     plans: ["premium"],
   *     onFailure: async (error) => {
   *       // Request billing immediately
   *       const admin = context.get(adminContext);
   *       return admin.billing.request({ plan: "premium" });
   *     }
   *   })
   * ];
   *
   * export async function loader({ context }: LoaderFunctionArgs) {
   *   // This only runs if authentication and billing checks pass
   *   const admin = context.get(adminContext);
   *   const response = await admin.admin.graphql(`{ shop { name } }`);
   *   return json(await response.json());
   * }
   * ```
   */
  middleware: {
    /**
     * Authentication middleware that validates sessions and creates admin context.
     *
     * This middleware validates the session, creates an admin context with all APIs (GraphQL, billing, scopes),
     * and makes it available to loaders and actions through React Router's context.
     *
     * @example
     * <caption>Basic authentication for admin routes</caption>
     * <description>Protect all admin routes by adding authentication middleware to the parent route.</description>
     * ```ts
     * // /app/routes/app.tsx
     * import shopify from "../shopify.server";
     * import { Outlet } from "react-router";
     *
     * export const middleware = [
     *   shopify.middleware.withAuthentication()
     * ];
     *
     * export default function App() {
     *   return <Outlet />;
     * }
     * ```
     *
     * @example
     * <caption>Accessing the admin context in loaders</caption>
     * <description>Use the admin context to make API calls and access billing/scopes operations.</description>
     * ```ts
     * // /app/routes/app.products.tsx
     * import { LoaderFunctionArgs, json } from "react-router";
     * import { adminContext } from "@shopify/shopify-app-react-router/server";
     *
     * export async function loader({ context }: LoaderFunctionArgs) {
     *   const admin = context.get(adminContext);
     *
     *   // GraphQL API
     *   const response = await admin.admin.graphql(`
     *     query {
     *       products(first: 10) {
     *         nodes { id title }
     *       }
     *     }
     *   `);
     *
     *   // Billing API (always available)
     *   const billingStatus = await admin.billing.check();
     *
     *   // Scopes API (always available)
     *   const scopes = await admin.scopes.query();
     *
     *   return json({
     *     products: await response.json(),
     *     billing: billingStatus,
     *     scopes
     *   });
     * }
     * ```
     */
    withAuthentication: (options?: AuthMiddlewareOptions) => MiddlewareFunction;

    /**
     * Billing middleware that enforces payment requirements.
     *
     * This middleware checks if the shop has an active payment for the specified plans,
     * and calls the onFailure callback if the requirement is not met. This matches the
     * behavior of the existing `billing.require()` function.
     *
     * Must be used AFTER withAuthentication middleware.
     *
     * @example
     * <caption>Requiring a premium plan with immediate billing request</caption>
     * <description>Request billing immediately if the merchant doesn't have an active premium plan.</description>
     * ```ts
     * // /app/routes/app.premium-features.tsx
     * import shopify from "../shopify.server";
     * import { adminContext } from "@shopify/shopify-app-react-router/server";
     *
     * export const middleware = [
     *   shopify.middleware.withAuthentication(),
     *   shopify.middleware.withBillingRequired({
     *     plans: ["premium"],
     *     onFailure: async (error) => {
     *       // This will redirect to Shopify's billing page
     *       const admin = context.get(adminContext);
     *       return admin.billing.request({
     *         plan: "premium",
     *         returnUrl: "/app/premium-features"
     *       });
     *     }
     *   })
     * ];
     *
     * export async function loader({ context }: LoaderFunctionArgs) {
     *   // This only runs if the merchant has an active premium plan
     *   const admin = context.get(adminContext);
     *   // ... premium feature logic
     * }
     * ```
     *
     * @example
     * <caption>Redirecting to a plan selection page</caption>
     * <description>Redirect to a custom billing page where merchants can choose a plan.</description>
     * ```ts
     * // /app/routes/app.analytics.tsx
     * import shopify from "../shopify.server";
     * import { redirect } from "react-router";
     *
     * export const middleware = [
     *   shopify.middleware.withAuthentication(),
     *   shopify.middleware.withBillingRequired({
     *     plans: ["professional", "enterprise"],
     *     isTest: true,
     *     onFailure: async (error) => {
     *       // Redirect to a custom plan selection page
     *       return redirect("/app/select-plan");
     *     }
     *   })
     * ];
     * ```
     *
     * @example
     * <caption>Multiple acceptable plans</caption>
     * <description>Allow access if the merchant has any of the specified plans.</description>
     * ```ts
     * // /app/routes/app.advanced.tsx
     * import shopify from "../shopify.server";
     *
     * export const middleware = [
     *   shopify.middleware.withAuthentication(),
     *   shopify.middleware.withBillingRequired({
     *     plans: ["professional", "enterprise", "unlimited"],
     *     onFailure: async (error) => {
     *       return redirect("/app/billing");
     *     }
     *   })
     * ];
     * ```
     */
    withBillingRequired: (
      options: BillingRequiredOptions<Config>,
    ) => MiddlewareFunction;
  };
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
   * import { ApiVersion, shopifyApp } from "@shopify/shopify-app-react-router/server";
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
   *   return (errors);
   * }
   *
   * export async function action({ request }: ActionFunctionArgs) {
   *   const errors = shopify.login(request);
   *
   *   return (errors);
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
