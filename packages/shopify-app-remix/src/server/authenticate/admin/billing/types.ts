import {
  AppSubscription,
  BillingCheckParams,
  BillingCheckResponseObject,
  BillingRequestParams,
} from '@shopify/shopify-api';

import type {AppConfigArg} from '../../../config-types';

export interface RequireBillingOptions<Config extends AppConfigArg>
  extends Omit<BillingCheckParams, 'session' | 'plans' | 'returnObject'> {
  /**
   * The plans to check for. Must be one of the values defined in the `billing` config option.
   */
  plans: (keyof Config['billing'])[];
  /**
   * How to handle the request if the shop doesn't have an active payment for any plan.
   */
  onFailure: (error: any) => Promise<Response>;
}

export interface CheckBillingOptions<Config extends AppConfigArg>
  extends Omit<BillingCheckParams, 'session' | 'plans' | 'returnObject'> {
  /**
   * The plans to check for. Must be one of the values defined in the `billing` config option.
   */
  plans: (keyof Config['billing'])[];
}

export interface RequestBillingOptions<Config extends AppConfigArg>
  extends Omit<BillingRequestParams, 'session' | 'plan' | 'returnObject'> {
  /**
   * The plan to request. Must be one of the values defined in the `billing` config option.
   */
  plan: keyof Config['billing'];
  /**
   * Whether to use the test mode. This prevents the credit card from being charged. Test shops and demo shops cannot be charged.
   */
  isTest?: boolean;
  /**
   * The URL to return to after the merchant approves the payment.
   */
  returnUrl?: string;
}

export interface CancelBillingOptions {
  /**
   * The ID of the subscription to cancel.
   */
  subscriptionId: string;
  /**
   * Whether to prorate the cancellation.
   *
   * {@link https://shopify.dev/docs/apps/billing/subscriptions/cancel-recurring-charges}
   */
  prorate?: boolean;
  /*
   * Whether to use the test mode. This prevents the credit card from being charged. Test shops and demo shops cannot be charged.
   */
  isTest?: boolean;
}

export interface BillingContext<Config extends AppConfigArg> {
  /**
   * Checks if the shop has an active payment for any plan defined in the `billing` config option.
   *
   * @returns A promise that resolves to an object containing the active purchases for the shop.
   *
   * @example
   * <caption>Requesting billing right away.</caption>
   * <description>Call `billing.request` in the `onFailure` callback to immediately redirect to the Shopify page to request payment.</description>
   * ```ts
   * // /app/routes/**\/*.ts
   * import { LoaderFunctionArgs } from "@remix-run/node";
   * import { authenticate, MONTHLY_PLAN } from "../shopify.server";
   *
   * export const loader = async ({ request }: LoaderFunctionArgs) => {
   *   const { billing } = await authenticate.admin(request);
   *   await billing.require({
   *     plans: [MONTHLY_PLAN],
   *     isTest: true,
   *     onFailure: async () => billing.request({ plan: MONTHLY_PLAN }),
   *   });
   *
   *   // App logic
   * };
   * ```
   * ```ts
   * // shopify.server.ts
   * import { shopifyApp, BillingInterval } from "@shopify/shopify-app-remix/server";
   *
   * export const MONTHLY_PLAN = 'Monthly subscription';
   * export const ANNUAL_PLAN = 'Annual subscription';
   *
   * const shopify = shopifyApp({
   *   // ...etc
   *   billing: {
   *     [MONTHLY_PLAN]: {
   *       amount: 5,
   *       currencyCode: 'USD',
   *       interval: BillingInterval.Every30Days,
   *     },
   *     [ANNUAL_PLAN]: {
   *       amount: 50,
   *       currencyCode: 'USD',
   *       interval: BillingInterval.Annual,
   *     },
   *   }
   * });
   * export default shopify;
   * export const authenticate = shopify.authenticate;
   * ```
   *
   * @example
   * <caption>Redirect to a plan selection page.</caption>
   * <description> When the app has multiple plans, create a page in your App that allows the merchant to select a plan. If a merchant does not have the required plan you can redirect them to page in your app to select one.</description>
   * ```ts
   * // /app/routes/**\/*.ts
   * import { LoaderFunctionArgs, redirect } from "@remix-run/node";
   * import { authenticate, MONTHLY_PLAN, ANNUAL_PLAN } from "../shopify.server";
   *
   * export const loader = async ({ request }: LoaderFunctionArgs) => {
   *   const { billing } = await authenticate.admin(request);
   *   const billingCheck = await billing.require({
   *     plans: [MONTHLY_PLAN, ANNUAL_PLAN],
   *     isTest: true,
   *     onFailure: () => redirect('/select-plan'),
   *   });
   *
   *   const subscription = billingCheck.appSubscriptions[0];
   *   console.log(`Shop is on ${subscription.name} (id ${subscription.id})`);
   *
   *   // App logic
   * };
   * ```
   * ```ts
   * // shopify.server.ts
   * import { shopifyApp, BillingInterval } from "@shopify/shopify-app-remix/server";
   *
   * export const MONTHLY_PLAN = 'Monthly subscription';
   * export const ANNUAL_PLAN = 'Annual subscription';
   *
   * const shopify = shopifyApp({
   *   // ...etc
   *   billing: {
   *     [MONTHLY_PLAN]: {
   *       amount: 5,
   *       currencyCode: 'USD',
   *       interval: BillingInterval.Every30Days,
   *     },
   *     [ANNUAL_PLAN]: {
   *       amount: 50,
   *       currencyCode: 'USD',
   *       interval: BillingInterval.Annual,
   *     },
   *   }
   * });
   * export default shopify;
   * export const authenticate = shopify.authenticate;
   * ```
   * @example
   * <caption>Requesting billing with line items</caption>
   * <description>Call `billing.request` with the `v3_lineItemBilling` future flag enabled</description>
   * ```ts
   * // /app/routes/**\/*.ts
   * import { LoaderFunctionArgs } from "@remix-run/node";
   * import { authenticate, MONTHLY_PLAN } from "../shopify.server";
   *
   * export const loader = async ({ request }: LoaderFunctionArgs) => {
   *   const { billing } = await authenticate.admin(request);
   *   await billing.require({
   *     plans: [MONTHLY_PLAN],
   *     isTest: true,
   *     onFailure: async () => billing.request({ plan: MONTHLY_PLAN }),
   *   });
   *
   *   // App logic
   * };
   * ```
   * ```ts
   * // shopify.server.ts
   * import { shopifyApp, BillingInterval } from "@shopify/shopify-app-remix/server";
   *
   * export const MONTHLY_PLAN = 'Monthly subscription';
   * export const ANNUAL_PLAN = 'Annual subscription';
   *
   * const shopify = shopifyApp({
   *   // ...etc
   *   billing: {
   *     [MONTHLY_PLAN]: {
   *       lineItems: [
   *        {
   *          amount: 5,
   *          currencyCode: 'USD',
   *          interval: BillingInterval.Every30Days,
   *         },
   *         {
   *          amount: 1,
   *          currencyCode: 'USD',
   *          interval: BillingInterval.Usage.
   *          terms: '1 dollar per 1000 emails',
   *         },
   *       ],
   *     },
   *   }
   *  future: {v3_lineItemBilling: true}
   * });
   * export default shopify;
   * export const authenticate = shopify.authenticate;
   * ```
   */
  require: (
    options: RequireBillingOptions<Config>,
  ) => Promise<BillingCheckResponseObject>;

  /**
   * Checks if the shop has an active payment for any plan defined in the `billing` config option.
   *
   * @returns A promise that resolves to an object containing the active purchases for the shop.
   *
   * @example
   * <caption>Check what billing plans a merchant is subscribed to.</caption>
   * <description>Use billing.check if you want to determine which plans are in use. Unlike `require`, `check` does not
   * throw an error if no active billing plans are present. </description>
   * ```ts
   * // /app/routes/**\/*.ts
   * import { LoaderFunctionArgs } from "@remix-run/node";
   * import { authenticate, MONTHLY_PLAN } from "../shopify.server";
   *
   * export const loader = async ({ request }: LoaderFunctionArgs) => {
   *   const { billing } = await authenticate.admin(request);
   *   const { hasActivePayment, appSubscriptions } = await billing.check({
   *     plans: [MONTHLY_PLAN],
   *     isTest: false,
   *   });
   *  console.log(hasActivePayment)
   *  console.log(appSubscriptions)
   * };
   * ```
   * ```ts
   * // shopify.server.ts
   * import { shopifyApp, BillingInterval } from "@shopify/shopify-app-remix/server";
   *
   * export const MONTHLY_PLAN = 'Monthly subscription';
   * export const ANNUAL_PLAN = 'Annual subscription';
   *
   * const shopify = shopifyApp({
   *   // ...etc
   *   billing: {
   *     [MONTHLY_PLAN]: {
   *       amount: 5,
   *       currencyCode: 'USD',
   *       interval: BillingInterval.Every30Days,
   *     },
   *     [ANNUAL_PLAN]: {
   *       amount: 50,
   *       currencyCode: 'USD',
   *       interval: BillingInterval.Annual,
   *     },
   *   }
   * });
   * export default shopify;
   * export const authenticate = shopify.authenticate;
   * ```
   *
   */
  check: (
    options: CheckBillingOptions<Config>,
  ) => Promise<BillingCheckResponseObject>;

  /**
   * Requests payment for the plan.
   *
   * @returns Redirects to the confirmation URL for the payment.
   *
   * @example
   * <caption>Using a custom return URL.</caption>
   * <description>Change where the merchant is returned to after approving the purchase using the `returnUrl` option.</description>
   * ```ts
   * // /app/routes/**\/*.ts
   * import { LoaderFunctionArgs } from "@remix-run/node";
   * import { authenticate, MONTHLY_PLAN } from "../shopify.server";
   *
   * export const loader = async ({ request }: LoaderFunctionArgs) => {
   *   const { billing } = await authenticate.admin(request);
   *   await billing.require({
   *     plans: [MONTHLY_PLAN],
   *     onFailure: async () => billing.request({
   *       plan: MONTHLY_PLAN,
   *       isTest: true,
   *       returnUrl: 'https://admin.shopify.com/store/my-store/apps/my-app/billing-page',
   *     }),
   *   });
   *
   *   // App logic
   * };
   * ```
   * ```ts
   * // shopify.server.ts
   * import { shopifyApp, BillingInterval } from "@shopify/shopify-app-remix/server";
   *
   * export const MONTHLY_PLAN = 'Monthly subscription';
   * export const ANNUAL_PLAN = 'Annual subscription';
   *
   * const shopify = shopifyApp({
   *   // ...etc
   *   billing: {
   *     [MONTHLY_PLAN]: {
   *       amount: 5,
   *       currencyCode: 'USD',
   *       interval: BillingInterval.Every30Days,
   *     },
   *     [ANNUAL_PLAN]: {
   *       amount: 50,
   *       currencyCode: 'USD',
   *       interval: BillingInterval.Annual,
   *     },
   *   }
   * });
   * export default shopify;
   * export const authenticate = shopify.authenticate;
   * ```
   */
  request: (options: RequestBillingOptions<Config>) => Promise<never>;

  /**
   * Cancels an ongoing subscription, given its ID.
   *
   * @returns The cancelled subscription.
   *
   * @example
   * <caption>Cancelling a subscription.</caption>
   * <description>Use the `billing.cancel` function to cancel an active subscription with the id returned from `billing.require`.</description>
   * ```ts
   * // /app/routes/cancel-subscription.ts
   * import { LoaderFunctionArgs } from "@remix-run/node";
   * import { authenticate, MONTHLY_PLAN } from "../shopify.server";
   *
   * export const loader = async ({ request }: LoaderFunctionArgs) => {
   *   const { billing } = await authenticate.admin(request);
   *   const billingCheck = await billing.require({
   *     plans: [MONTHLY_PLAN],
   *     onFailure: async () => billing.request({ plan: MONTHLY_PLAN }),
   *   });
   *
   *   const subscription = billingCheck.appSubscriptions[0];
   *   const cancelledSubscription = await billing.cancel({
   *     subscriptionId: subscription.id,
   *     isTest: true,
   *     prorate: true,
   *    });
   *
   *   // App logic
   * };
   * ```
   * ```ts
   * // shopify.server.ts
   * import { shopifyApp, BillingInterval } from "@shopify/shopify-app-remix/server";
   *
   * export const MONTHLY_PLAN = 'Monthly subscription';
   * export const ANNUAL_PLAN = 'Annual subscription';
   *
   * const shopify = shopifyApp({
   *   // ...etc
   *   billing: {
   *     [MONTHLY_PLAN]: {
   *       amount: 5,
   *       currencyCode: 'USD',
   *       interval: BillingInterval.Every30Days,
   *     },
   *     [ANNUAL_PLAN]: {
   *       amount: 50,
   *       currencyCode: 'USD',
   *       interval: BillingInterval.Annual,
   *     },
   *   }
   * });
   * export default shopify;
   * export const authenticate = shopify.authenticate;
   * ```
   */
  cancel: (options: CancelBillingOptions) => Promise<AppSubscription>;
}
