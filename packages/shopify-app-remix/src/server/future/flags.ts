// When adding new flags, you should also add them to the `TEST_FUTURE_FLAGS` object in `test-config.ts` to ensure that
// it doesn't cause regressions.
export interface FutureFlags {
  /**
   * When enabled, returns the same `admin` context (`AdminApiContext`) from `authenticate.webhook` that is returned from `authenticate.admin`.
   *
   * @default false
   */
  v3_webhookAdminContext?: boolean;

  /**
   * When enabled authenticate.public() will not work.  Use authenticate.public.checkout() instead.
   *
   * @default false
   */
  v3_authenticatePublic?: boolean;

  /**
   * When enabled allows you to specify billing plans as line items in the Shopify App configuration.
   *
   * @default false
   */
  unstable_lineItemBilling?: boolean;
}

export type FutureFlagOptions = FutureFlags | undefined;

export type FeatureEnabled<
  Future extends FutureFlagOptions,
  Flag extends keyof FutureFlags,
> = Future extends FutureFlags
  ? Future[Flag] extends true
    ? true
    : false
  : false;
