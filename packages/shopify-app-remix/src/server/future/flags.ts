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
   * When enabled, embedded apps will fetch access tokens via [token exchange](https://shopify.dev/docs/apps/auth/get-access-tokens/token-exchange/overview).
   * This assumes app are using declarative scopes with [Shopify managing installs](https://shopify.dev/docs/apps/auth/installation#shopify-managed-installation).
   *
   * @default false
   */
  unstable_newEmbeddedAuthStrategy?: boolean;
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
