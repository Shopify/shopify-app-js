import {
  RegisterReturn,
  Shopify,
  ShopifyRestResources,
} from '@shopify/shopify-api';
import {SessionStorage} from '@shopify/shopify-app-session-storage';

import type {AppConfig, AppConfigArg} from './config-types';
import type {AdminContext} from './authenticate/admin/types';
import type {
  AuthenticatePublicOptions,
  PublicContext,
} from './authenticate/public/types';
import type {
  RegisterWebhooksOptions,
  WebhookContext,
  WebhookContextWithSession,
} from './authenticate/webhooks/types';
import type {UnauthenticatedAdminContext} from './unauthenticated/admin/types';

export interface BasicParams {
  api: Shopify;
  config: AppConfig;
  logger: Shopify['logger'];
}

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
) => Promise<RegisterReturn>;

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

type AuthenticatePublic = (
  request: Request,
  options?: AuthenticatePublicOptions,
) => Promise<PublicContext>;

type AuthenticateWebhook<
  Resources extends ShopifyRestResources = ShopifyRestResources,
  Topics = string | number | symbol,
> = (
  request: Request,
) => Promise<
  WebhookContext<Topics> | WebhookContextWithSession<Topics, Resources>
>;

type UnauthenticatedAdmin<Resources extends ShopifyRestResources> = (
  shop: string,
) => Promise<UnauthenticatedAdminContext<Resources>>;

type RestResourcesType<Config extends AppConfigArg> =
  Config['restResources'] extends ShopifyRestResources
    ? Config['restResources']
    : ShopifyRestResources;

type SessionStorageType<Config extends AppConfigArg> =
  Config['sessionStorage'] extends SessionStorage
    ? Config['sessionStorage']
    : SessionStorage;

export interface ShopifyAppBase<Config extends AppConfigArg> {
  /**
   * The SessionStorage instance your app is using.
   *
   * An instance of the SessionStorage class you passed in as a config option.
   *
   * @example
   * Using Prisma
   * ```ts
   * // app/shopify.server.ts
   * import { shopifyApp } from "@shopify/shopify-app-remix";
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
   * Globally adding CSP headers to entry.server.tsx.
   * ```ts
   * // ~/shopify.server.ts
   * import { shopifyApp } from "@shopify/shopify-app-remix";
   *
   * const shopify = shopifyApp({
   *   // ...etc
   * });
   * export default shopify;
   * export const addDocumentResponseheaders = shopify.addDocumentResponseheaders;
   *
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
   * Registering webhooks when a merchant installs your app.
   * ```ts
   * import { DeliveryMethod, shopifyApp } from "@shopify/shopify-app-remix";
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
   */
  authenticate: {
    /**
     * Authenticate an admin Request and get back an authenticated admin context.  Use the authenticated admin context to interact with Shopify
     *
     * Examples of when to use this are requests from your app's UI, or requests from admin extensions.
     *
     * If there is no session for the Request, this will redirect the merchant to correct auth flows.
     *
     * @example
     * Registering webhooks and seeding data when a merchant installs your app.
     * ```ts
     * // app/shopify.server.ts
     * import { LATEST_API_VERSION, shopifyApp } from "@shopify/shopify-app-remix";
     * import { restResources } from "@shopify/shopify-api/rest/admin/2023-04";
     *
     * const shopify = shopifyApp({
     *   restResources,
     *   // ...etc
     * });
     * export default shopify;
     * export const authenticate = shopify.authenticate;
     *
     * // app/routes/**\/*.jsx
     * import { LoaderArgs, json } from "@remix-run/node";
     * import { authenticate } from "../../shopify.server";
     *
     * export async function loader({ request }: LoaderArgs) {
     *   const {admin, session, sessionToken, billing} = authenticate.admin(request);
     *
     *   return json(await admin.rest.resources.Product.count({ session }));
     * }
     * ```
     */
    admin: AuthenticateAdmin<Config, RestResourcesType<Config>>;

    /**
     * Authenticate a public request and get back a session token
     *
     * An example of when to use this is a request from a checkout extension.
     *
     * @example
     * Authenticating a request from a checkout extension
     *
     * ```ts
     * // app/routes/api/checkout.jsx
     * import { LoaderArgs, json } from "@remix-run/node";
     * import { authenticate } from "../../shopify.server";
     * import { getWidgets } from "~/db/widgets";
     *
     * export async function loader({ request }: LoaderArgs) {
     *   const {sessionToken} = authenticate.public(request);
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
     * Authenticating a webhook request
     *
     * ```ts
     * // app/routes/api/checkout.jsx
     * import {
     *   DeliveryMethod,
     *   shopifyApp,
     * } from "@shopify/shopify-app-remix";
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
     *
     * // app/routes/webhooks.ts
     * import { ActionArgs } from "@remix-run/node";
     * import { authenticate } from "../shopify.server";
     * import db from "../db.server";
     *
     * export const action = async ({ request }: ActionArgs) => {
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
      RestResourcesType<Config>,
      keyof Config['webhooks'] | MandatoryTopics
    >;
  };

  /**
   * Methods for getting Contexts from requests that do not originate from Shopify
   *
   */
  unauthenticated: {
    /**
     * Get an admin context by passing a shop
     *
     * **Warning** This should only be used for Requests that do not originate from Shopify.
     * You must do your own authentication before using this method.
     * This method throws an error if there is no session for the shop.
     *
     * @example
     * Responding to a request from an external service not controlled by Shopify.
     * ```ts
     * // app/shopify.server.ts
     * import { LATEST_API_VERSION, shopifyApp } from "@shopify/shopify-app-remix";
     * import { restResources } from "@shopify/shopify-api/rest/admin/2023-04";
     *
     * const shopify = shopifyApp({
     *   restResources,
     *   // ...etc
     * });
     * export default shopify;
     *
     * // app/routes/**\/*.jsx
     * import { LoaderArgs, json } from "@remix-run/node";
     * import { authenticateExternal } from "~/helpers/authenticate"
     * import shopify from "../../shopify.server";
     *
     * export async function loader({ request }: LoaderArgs) {
     *   const shop = await authenticateExternal(request)
     *   const {admin} = await shopify.unauthenticated.admin(shop);
     *
     *   return json(await admin.rest.resources.Product.count({ session }));
     * }
     * ```
     */
    admin: UnauthenticatedAdmin<RestResourcesType<Config>>;
  };
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
   * Providing a login form as a route that can handle GET and POST requests.
   * export async function loader({ request }: LoaderArgs) {
   *   const errors = shopify.login(request);
   *
   *   return json(errors);
   * }
   *
   * export async function action({ request }: ActionArgs) {
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
 * By default, the app's distribution will be AppStore.
 */
export type ShopifyApp<Config extends AppConfigArg> =
  Config['distribution'] extends AppDistribution.ShopifyAdmin
    ? AdminApp<Config>
    : Config['distribution'] extends AppDistribution.SingleMerchant
    ? SingleMerchantApp<Config>
    : Config['distribution'] extends AppDistribution.AppStore
    ? AppStoreApp<Config>
    : AppStoreApp<Config>;
