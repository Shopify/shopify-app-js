import {
  RequestType,
  TEST_SHOP,
  setUpValidSession,
  setupValidRequest,
  testConfig,
} from '../__test-helpers';
import {shopifyApp} from '../shopify-app';
import {
  AdminApiContext,
  AdminContext,
  AdminGraphqlClient,
  AppProxyContext,
  CheckoutContext,
  CustomerAccountContext,
  FlowContext,
  FulfillmentServiceContext,
  StorefrontApiContext,
  StorefrontGraphqlClient,
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
    const realContext = await shopify.unauthenticated.admin(session.shop);
    const context: UnauthenticatedAdminContext<typeof shopify> = realContext;
    const apiContext: AdminApiContext<typeof shopify> = realContext.admin;
    const graphqlClient: AdminGraphqlClient<typeof shopify> =
      realContext.admin.graphql;

    // THEN
    expect(context.admin).toBeDefined();
    expect(apiContext.graphql).toBeDefined();
    expect(graphqlClient).toBeDefined();
  });

  it('unauthenticated.storefront', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig());
    const session = await setUpValidSession(shopify.sessionStorage);

    // WHEN
    const realContext = await shopify.unauthenticated.storefront(session.shop);
    const context: UnauthenticatedStorefrontContext<typeof shopify> =
      realContext;
    const apiContext: StorefrontApiContext<typeof shopify> =
      realContext.storefront;
    const graphqlClient: StorefrontGraphqlClient<typeof shopify> =
      realContext.storefront.graphql;

    // THEN
    expect(context.storefront).toBeDefined();
    expect(apiContext.graphql).toBeDefined();
    expect(graphqlClient).toBeDefined();
  });

  it('authenticate.admin', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig());
    const {request} = await setupValidRequest(shopify, {
      type: RequestType.Admin,
    });

    // WHEN
    const realContext = await shopify.authenticate.admin(request);
    const context: AdminContext<typeof shopify> = realContext;
    const apiContext: AdminApiContext<typeof shopify> = realContext.admin;
    const graphqlClient: AdminGraphqlClient<typeof shopify> =
      realContext.admin.graphql;

    // THEN
    expect(context.admin).toBeDefined();
    expect(apiContext.graphql).toBeDefined();
    expect(graphqlClient).toBeDefined();
  });

  it('authenticate.flow', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig());
    const {request} = await setupValidRequest(shopify, {
      type: RequestType.Extension,
      body: {shopify_domain: TEST_SHOP},
    });

    // WHEN
    const realContext = await shopify.authenticate.flow(request);
    const context: FlowContext<typeof shopify> = realContext;
    const apiContext: AdminApiContext<typeof shopify> = realContext.admin;
    const graphqlClient: AdminGraphqlClient<typeof shopify> =
      realContext.admin.graphql;

    // THEN
    expect(context.admin).toBeDefined();
    expect(apiContext.graphql).toBeDefined();
    expect(graphqlClient).toBeDefined();
  });

  it('authenticate.fulfillmentService', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig());
    const {request} = await setupValidRequest(shopify, {
      type: RequestType.Extension,
      body: {kind: 'FULFILLMENT_REQUEST'},
    });

    // WHEN
    const realContext = await shopify.authenticate.fulfillmentService(request);
    const context: FulfillmentServiceContext<typeof shopify> = realContext;
    const apiContext: AdminApiContext<typeof shopify> = realContext.admin;
    const graphqlClient: AdminGraphqlClient<typeof shopify> =
      realContext.admin.graphql;

    // THEN
    expect(context.admin).toBeDefined();
    expect(apiContext.graphql).toBeDefined();
    expect(graphqlClient).toBeDefined();
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
    const realContext = await shopify.authenticate.webhook(request);
    const context: WebhookContext<typeof shopify> = realContext;
    const apiContext: AdminApiContext<typeof shopify> = realContext.admin!;
    const graphqlClient: AdminGraphqlClient<typeof shopify> =
      realContext.admin!.graphql;

    // THEN
    expect(context.admin).toBeDefined();
    expect(apiContext.graphql).toBeDefined();
    expect(graphqlClient).toBeDefined();
  });

  it('authenticate.public.appProxy', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig());
    const {request} = await setupValidRequest(shopify, {
      type: RequestType.Public,
    });

    // WHEN
    const realContext = await shopify.authenticate.public.appProxy(request);
    const context: AppProxyContext<typeof shopify> = realContext;
    const apiContext: AdminApiContext<typeof shopify> = realContext.admin!;
    const graphqlClient: AdminGraphqlClient<typeof shopify> =
      realContext.admin!.graphql;

    // THEN
    expect(context.admin).toBeDefined();
    expect(apiContext.graphql).toBeDefined();
    expect(graphqlClient).toBeDefined();
  });

  it('authenticate.public.checkout', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig());
    const {request} = await setupValidRequest(shopify, {
      type: RequestType.Bearer,
    });

    // WHEN
    const realContext = await shopify.authenticate.public.checkout(request);
    const context: CheckoutContext<typeof shopify> = realContext;

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
    const realContext =
      await shopify.authenticate.public.customerAccount(request);
    const context: CustomerAccountContext<typeof shopify> = realContext;

    // THEN
    expect(context.cors).toBeDefined();
  });
});
