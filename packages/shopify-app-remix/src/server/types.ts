import {
  ConfigParams,
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
import type {AdminContext} from './authenticate/admin/types';
import type {Unauthenticated} from './unauthenticated/types';
import {FutureFlagOptions, FutureFlags} from './future/flags';

export interface BasicParams<
  Future extends FutureFlagOptions = FutureFlagOptions,
> {
  api: Shopify<ApiConfigWithFutureFlags<Future>>;
  config: AppConfig;
  logger: Shopify['logger'];
}

export type ApiConfigWithFutureFlags<Future extends FutureFlagOptions> =
  ConfigParams & {
    future?: {
      unstable_tokenExchange?: Future extends FutureFlags
        ? Future['unstable_newEmbeddedAuthStrategy']
        : boolean;
    };
  };

export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONObject
  | JSONArray;

// eslint-disable-next-line no-warning-comments
// TODO: Use this enum to replace the isCustomStoreApp config option in shopify-api-js
export enum AppDistribution {
  AppStore = 'app_store',
  SingleMerchant = 'single_merchant',
  ShopifyAdmin = 'shopify_admin',
}

export type MandatoryTopics =
  | 'CUSTOMERS_DATA_REQUEST'
  | 'CUSTOMERS_REDACT'
  | 'SHOP_REDACT';

interface JSONObject {
  [x: string]: JSONValue;
}

interface JSONArray extends Array<JSONValue> {}

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

type AuthenticateAdmin<
  Config extends AppConfigArg,
  Resources extends ShopifyRestResources = ShopifyRestResources,
> = (request: Request) => Promise<AdminContext<Config, Resources>>;

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
   */
  admin: AuthenticateAdmin<Config, RestResourcesType<Config>>;

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
  public: AuthenticatePublic<Config['future']>;

  /**
   * Authenticate a Shopify webhook request, get back an authenticated admin context and details on the webhook request
   *
   * @example
   * <caption>Authenticating a webhook request</caption>
   *
   * ```ts
   * // /app/shopify.server.ts
   * import { DeliveryMethod, shopifyApp } from "@shopify/shopify-app-remix/server";
   *
   * const shopify = shopifyApp({
   *   webhooks: {
   *    APP_UNINSTALLED: {
   *       deliveryMethod: DeliveryMethod.Http,
   *       callbackUrl: "/webhooks",
   *     },
   *   },
   *   hooks: {
   *     afterAuth: async ({ session }) => {
   *       shopify.registerWebhooks({ session });
   *     },
   *   },
   *   // ...etc
   * });
   * export default shopify;
   * export const authenticate = shopify.authenticate;
   * ```
   * ```ts
   * // /app/routes/webhooks.ts
   * import { ActionFunctionArgs } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   * import db from "../db.server";
   *
   * export const action = async ({ request }: ActionFunctionArgs) => {
   *   const { topic, shop, session } = await authenticate.webhook(request);
   *
   *   switch (topic) {
   *     case "APP_UNINSTALLED":
   *       if (session) {
   *         await db.session.deleteMany({ where: { shop } });
   *       }
   *       break;
   *     case "CUSTOMERS_DATA_REQUEST":
   *     case "CUSTOMERS_REDACT":
   *     case "SHOP_REDACT":
   *     default:
   *       throw new Response("Unhandled webhook topic", { status: 404 });
   *   }
   *
   *   throw new Response();
   * };
   * ```
   */
  webhook: AuthenticateWebhook<
    Config['future'],
    RestResourcesType<Config>,
    keyof Config['webhooks'] | MandatoryTopics
  >;
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
   *   sesssionStorage: new PrismaSessionStorage(prisma),
   *   // ...etc
   * })
   *
   * // shopify.sessionStorage is an instance of PrismaSessionStorage
   * ```
   */
  sessionStorage: SessionStorageType<Config>;

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
   * Register webhook topics for a store using the given session. Most likely you want to use this in combination with the afterAuth hook.
   *
   * @example
   * <caption>Registering webhooks after install</caption>
   * <description>Trigger the registration to create the webhook subscriptions after a merchant installs your app using the `afterAuth` hook. Learn more about [subscribing to webhooks.](/docs/api/shopify-app-remix/v1/guide-webhooks)</description>
   * ```ts
   * // /app/shopify.server.ts
   * import { DeliveryMethod, shopifyApp } from "@shopify/shopify-app-remix/server";
   *
   * const shopify = shopifyApp({
   *   hooks: {
   *     afterAuth: async ({ session }) => {
   *       shopify.registerWebhooks({ session });
   *     }
   *   },
   *   webhooks: {
   *     APP_UNINSTALLED: {
   *       deliveryMethod: DeliveryMethod.Http,
   *        callbackUrl: "/webhooks",
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

interface ShopifyAppLogin {
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

/**
 * An object your app can use to interact with Shopify.
 *
 * By default, the app's distribution is `AppStore`.
 */
export type ShopifyApp<Config extends AppConfigArg> =
  Config['distribution'] extends AppDistribution.ShopifyAdmin
    ? AdminApp<Config>
    : Config['distribution'] extends AppDistribution.SingleMerchant
    ? SingleMerchantApp<Config>
    : Config['distribution'] extends AppDistribution.AppStore
    ? AppStoreApp<Config>
    : AppStoreApp<Config>;
