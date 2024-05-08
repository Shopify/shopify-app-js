// This file contains types we want to export to make it easier for apps to pass the contexts we return as types

import {BillingInterval, DeliveryMethod} from '@shopify/shopify-api';
import {restResources} from '@shopify/shopify-api/rest/admin/2023-04';
import {MemorySessionStorage} from '@shopify/shopify-app-session-storage-memory';

import {shopifyApp} from './shopify-app';
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
} from './types-contexts';

const MONTHLY_PLAN = 'monthly';

const shopify = shopifyApp({
  appUrl: 'https://example.com',
  apiKey: '',
  apiSecretKey: '',
  sessionStorage: new MemorySessionStorage(),
  restResources,
  webhooks: {
    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: '/webhooks',
    },
  },
  billing: {
    [MONTHLY_PLAN]: {
      lineItems: [
        {
          interval: BillingInterval.Every30Days,
          amount: 5,
          currencyCode: 'USD',
        },
        {
          interval: BillingInterval.Usage,
          amount: 1,
          currencyCode: 'USD',
          terms: '1 dollar per 1000 emails',
        },
      ],
    },
  },
  future: {
    v3_webhookAdminContext: true,
    v3_authenticatePublic: true,
    v3_lineItemBilling: true,
    unstable_newEmbeddedAuthStrategy: true,
  },
});

async function doQuery(graphql: AdminGraphqlClient<typeof shopify>) {
  const response = await graphql('');
  console.log(response.text());
}

async function useClient(admin: AdminApiContext<typeof shopify>) {
  const response = await admin.rest.resources.Product.all({
    session: {} as any,
  });
  console.log(response.data[0].handle);

  await doQuery(admin.graphql);
}

async function doSfQuery(graphql: StorefrontGraphqlClient<typeof shopify>) {
  const response = await graphql('');
  console.log(response.text());
}

async function useSfClient(storefront: StorefrontApiContext<typeof shopify>) {
  const response = await storefront.graphql('');
  console.log(response.text());

  await doSfQuery(storefront.graphql);
}

async function loader() {
  const request = {} as any;
  const response = {} as any;

  const uAdmin = await shopify.unauthenticated.admin('');
  const uAdminContext: UnauthenticatedAdminContext<typeof shopify> = uAdmin;
  const resp = await uAdminContext.admin.rest.resources.Product.all({
    session: uAdminContext.session,
  });
  console.log(resp.data[0].handle);

  const admin = await shopify.authenticate.admin(request);
  const adminContext: AdminContext<typeof shopify> = admin;
  adminContext.admin.rest.resources.Product.all({
    session: adminContext.session,
  });
  await adminContext.billing.check({plans: [MONTHLY_PLAN], isTest: true});
  await adminContext.billing.request({plan: MONTHLY_PLAN, amount: 1});
  adminContext.cors(response).text();
  adminContext.redirect(response).text();
  console.log(adminContext.sessionToken);

  await useClient(adminContext.admin);

  const uSf = await shopify.unauthenticated.storefront('');
  const uSfContext: UnauthenticatedStorefrontContext<typeof shopify> = uSf;
  (await uSfContext.storefront.graphql('')).text();

  const flow = await shopify.authenticate.flow(request);
  const flowContext: FlowContext<typeof shopify> = flow;
  flowContext.admin.rest.resources.Product.all({
    session: flowContext.session,
  });
  console.log(flowContext.payload);

  const fs = await shopify.authenticate.fulfillmentService(request);
  const fsContext: FulfillmentServiceContext<typeof shopify> = fs;
  fsContext.admin.rest.resources.Product.all({
    session: fsContext.session,
  });
  console.log(fsContext.payload.kind);

  const appProxy = await shopify.authenticate.public.appProxy(request);
  const appProxyContext: AppProxyContext<typeof shopify> = appProxy;
  appProxyContext.admin?.rest.resources.Product.all({
    session: appProxyContext.session,
  });
  (await appProxyContext.storefront?.graphql(''))?.text();
  appProxyContext.liquid(response).text();

  await useSfClient(appProxyContext.storefront!);

  const checkout = await shopify.authenticate.public.checkout(request);
  const checkoutContext: CheckoutContext<typeof shopify> = checkout;
  checkoutContext.cors(response).text();

  const customerAccount =
    await shopify.authenticate.public.customerAccount(request);
  const customerAccountContext: CustomerAccountContext<typeof shopify> =
    customerAccount;
  customerAccountContext.cors(response).text();

  const webhook = await shopify.authenticate.webhook(request);
  const webhookContext: WebhookContext<typeof shopify> = webhook;
  webhookContext.admin?.rest.resources.Product.all({
    session: webhookContext.session,
  });
  console.log(
    webhookContext.apiVersion,
    webhookContext.shop,
    webhookContext.topic,
    webhookContext.subTopic,
    webhookContext.payload,
  );
  switch (webhookContext.topic) {
    case 'APP_UNINSTALLED':
      break;
  }
}

loader();
