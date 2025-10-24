import {type MiddlewareFunction} from 'react-router';

import type {AppConfigArg} from '../config-types';
import type {BasicParams} from '../types';

import {adminContext} from './contexts';
import type {BillingRequiredOptions} from './types';

/**
 * Creates middleware that enforces billing requirements.
 *
 * This middleware works similarly to `billing.require()` from the authenticate.admin() pattern.
 * It checks if the shop has an active payment for any of the specified plans, and calls
 * the onFailure callback if the requirement is not satisfied.
 *
 * IMPORTANT: This middleware only performs authorization checks.
 * All billing operations (check, request, cancel, createUsageRecord, etc.)
 * are available through admin.billing regardless of whether this middleware is used.
 *
 * Use this middleware when you want to BLOCK access to routes that require
 * specific billing plans.
 *
 * @example
 * ```typescript
 * // Require premium plan, auto-request if not active
 * export const middleware = [
 *   withAuthentication(),
 *   withBillingRequired({
 *     plans: ["premium"],
 *     onFailure: async (admin) => {
 *       // Has access to admin context - can call billing.request()
 *       return admin.billing.request({ plan: "premium" });
 *     }
 *   })
 * ];
 * ```
 *
 * @example
 * ```typescript
 * // Require either professional or enterprise plan, redirect to custom page
 * export const middleware = [
 *   withAuthentication(),
 *   withBillingRequired({
 *     plans: ["professional", "enterprise"],
 *     isTest: true,
 *     onFailure: async (admin) => {
 *       // Can use admin.session or other context
 *       return redirect(`/select-plan?shop=${admin.session.shop}`);
 *     }
 *   })
 * ];
 * ```
 *
 * @example
 * ```typescript
 * // Custom logic in onFailure
 * export const middleware = [
 *   withAuthentication(),
 *   withBillingRequired({
 *     plans: ["premium"],
 *     onFailure: async (admin) => {
 *       // Check trial status
 *       const billing = await admin.billing.check();
 *       const isTrial = billing.appSubscriptions.some(s => s.trialDays > 0);
 *
 *       if (isTrial) {
 *         return redirect("/app/trial-expired");
 *       }
 *
 *       return admin.billing.request({ plan: "premium" });
 *     }
 *   })
 * ];
 * ```
 */
export function createWithBillingRequired<Config extends AppConfigArg>(
  params: BasicParams,
  options: BillingRequiredOptions<Config>,
): MiddlewareFunction {
  const {logger, config} = params;
  const {plans, onFailure, isTest = config.billing?.test} = options;

  return async ({context}, next) => {
    // Get admin context created by authentication middleware
    const admin = context.get(adminContext);

    if (!admin) {
      logger.error(
        'withBillingRequired requires withAuthentication to run first',
      );
      throw new Response(
        'Unauthorized: withBillingRequired requires withAuthentication to run first',
        {
          status: 401,
        },
      );
    }

    const logContext = {
      shop: admin.session.shop,
      plans,
      isTest,
    };

    logger.debug('Checking billing for the shop', logContext);

    try {
      // Check current billing status using admin.billing API
      const billingStatus = await admin.billing.check(
        isTest !== undefined ? ({plans, isTest} as any) : ({plans} as any),
      );

      if (!billingStatus.hasActivePayment) {
        logger.debug('Billing check failed', logContext);

        // Call the onFailure callback with admin context
        // This allows calling admin.billing.request() like billing.require() does
        throw await onFailure(admin);
      }

      logger.debug('Billing check succeeded', logContext);

      // Billing satisfied, continue to loaders
      return next();
    } catch (error) {
      // If it's already a Response (from onFailure), re-throw it
      if (error instanceof Response) {
        throw error;
      }

      // Log unexpected errors
      logger.error('Unexpected error checking billing', {
        error,
        shop: admin.session.shop,
      });

      throw error;
    }
  };
}

/**
 * Wrapper function for easier usage with pre-configured params
 * This is what gets exposed through the shopify.middleware API
 */
export function withBillingRequiredFactory<Config extends AppConfigArg>(
  params: BasicParams,
) {
  return (options: BillingRequiredOptions<Config>): MiddlewareFunction => {
    return createWithBillingRequired(params, options);
  };
}
