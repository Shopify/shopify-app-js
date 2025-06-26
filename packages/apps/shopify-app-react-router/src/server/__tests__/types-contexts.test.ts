import {
  RequestType,
  TEST_SHOP,
  setUpValidSession,
  setupValidRequest,
  testConfig,
} from '../__test-helpers';
import {shopifyApp} from '../shopify-app';
import {
  AdminContext,
  AppProxyContext,
  CheckoutContext,
  CustomerAccountContext,
  FlowContext,
  FulfillmentServiceContext,
  UnauthenticatedAdminContext,
  UnauthenticatedStorefrontContext,
  WebhookContext,
} from '../types-contexts';

// These tests aren't asserting anything useful, but if the types are incorrect they'll still cause failures
describe('assign authentication contexts to variables', () => {
  it('unauthenticated.admin', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig());
    const session = await setUpValidSession(shopify.sessionStorage);

    // WHEN
    const context: UnauthenticatedAdminContext =
      await shopify.unauthenticated.admin(session.shop);

    // THEN
    expect(context.admin.graphql).toBeDefined();
  });

  it('unauthenticated.storefront', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig());
    const session = await setUpValidSession(shopify.sessionStorage);

    // WHEN
    const context: UnauthenticatedStorefrontContext =
      await shopify.unauthenticated.storefront(session.shop);

    // THEN
    expect(context.storefront.graphql).toBeDefined();
  });

  it('authenticate.admin', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig());
    const {request} = await setupValidRequest(shopify, {
      type: RequestType.Admin,
    });

    // WHEN
    const context: AdminContext = await shopify.authenticate.admin(request);

    // THEN
    expect(context.admin.graphql).toBeDefined();
  });

  it('authenticate.flow', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig());
    const {request} = await setupValidRequest(shopify, {
      type: RequestType.Extension,
      body: {shopify_domain: TEST_SHOP},
    });

    // WHEN
    const context: FlowContext = await shopify.authenticate.flow(request);

    // THEN
    expect(context.admin.graphql).toBeDefined();
  });

  it('authenticate.fulfillmentService', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig());
    const {request} = await setupValidRequest(shopify, {
      type: RequestType.Extension,
      body: {kind: 'FULFILLMENT_REQUEST'},
    });

    // WHEN
    const context: FulfillmentServiceContext =
      await shopify.authenticate.fulfillmentService(request);

    // THEN
    expect(context.admin.graphql).toBeDefined();
  });

  it('authenticate.webhook', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig());
    const {request} = await setupValidRequest(shopify, {
      type: RequestType.Extension,
      body: {payload: 'test'},
      headers: {
        'X-Shopify-Topic': 'app/uninstalled',
        'X-Shopify-API-Version': '2023-01',
        'X-Shopify-Webhook-Id': '1234567890',
      },
    });

    // WHEN
    const context: WebhookContext = await shopify.authenticate.webhook(request);

    // THEN
    expect(context.admin!.graphql).toBeDefined();
  });

  it('authenticate.public.appProxy', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig());
    const {request} = await setupValidRequest(shopify, {
      type: RequestType.Public,
    });

    // WHEN
    const context: AppProxyContext =
      await shopify.authenticate.public.appProxy(request);

    // THEN
    expect(context.admin!.graphql).toBeDefined();
  });

  it('authenticate.public.checkout', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig());
    const {request} = await setupValidRequest(shopify, {
      type: RequestType.Bearer,
    });

    // WHEN
    const context: CheckoutContext =
      await shopify.authenticate.public.checkout(request);

    // THEN
    expect(context.cors).toBeDefined();
  });

  it('authenticate.public.customerAccount', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig());
    const {request} = await setupValidRequest(shopify, {
      type: RequestType.Bearer,
    });

    // WHEN
    const context: CustomerAccountContext =
      await shopify.authenticate.public.customerAccount(request);

    // THEN
    expect(context.cors).toBeDefined();
  });
});
