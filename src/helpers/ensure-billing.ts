import { RequestReturn, SessionInterface, Shopify } from "@shopify/shopify-api";
import { GraphqlClient } from "@shopify/shopify-api/dist/clients/graphql";
import { CONFIG } from "../config";

export enum BillingInterval {
  OneTime = "ONE_TIME",
  Every30Days = "EVERY_30_DAYS",
  Annual = "ANNUAL",
};

const RECURRING_INTERVALS = [
  BillingInterval.Every30Days,
  BillingInterval.Annual,
];

let isProd: boolean;

/**
 * You may want to charge merchants for using your app. This helper provides that function by checking if the current
 * merchant has an active one-time payment or subscription named `chargeName`. If no payment is found,
 * this helper requests it and returns a confirmation URL so that the merchant can approve the purchase.
 *
 * Learn more about billing in our documentation: https://shopify.dev/apps/billing
 */
export async function ensureBilling(
  session: SessionInterface,
  isProdOverride = process.env.NODE_ENV === "production"
) {
  if (typeof CONFIG.billing.interval === 'undefined') {
    throw 'No billing interval configured';
  }

  if (!Object.values(BillingInterval).includes(CONFIG.billing.interval as unknown as BillingInterval)) {
    throw `Unrecognized billing interval '${CONFIG.billing.interval}'`;
  }

  isProd = isProdOverride;

  let hasPayment: boolean;
  let confirmationUrl: string | null = null;

  if (await hasActivePayment(session)) {
    hasPayment = true;
  } else {
    hasPayment = false;
    confirmationUrl = await requestPayment(session);
  }

  return [hasPayment, confirmationUrl];
}

async function hasActivePayment(session: SessionInterface): Promise<boolean> {
  const client = new Shopify.Clients.Graphql(session.shop, session.accessToken);

  if (isRecurring(CONFIG.billing.interval!)) {
    const currentInstallations: RequestReturn = await client.query({
      data: RECURRING_PURCHASES_QUERY,
    });
    const subscriptions =
      (currentInstallations.body as {[key: string]: any}).data.currentAppInstallation.activeSubscriptions;

    for (let i = 0, len = subscriptions.length; i < len; i++) {
      if (
        subscriptions[i].name === CONFIG.billing.chargeName &&
        (!isProd || !subscriptions[i].test)
      ) {
        return true;
      }
    }
  } else {
    let purchases;
    let endCursor = null;
    do {
      const currentInstallations: RequestReturn = await client.query({
        data: {
          query: ONE_TIME_PURCHASES_QUERY,
          variables: { endCursor },
        },
      });
      purchases =
        (currentInstallations.body as {[key: string]: any}).data.currentAppInstallation.oneTimePurchases;

      for (let i = 0, len = purchases.edges.length; i < len; i++) {
        const node = purchases.edges[i].node;
        if (
          node.name === CONFIG.billing.chargeName &&
          (!isProd || !node.test) &&
          node.status === "ACTIVE"
        ) {
          return true;
        }
      }

      endCursor = purchases.pageInfo.endCursor;
    } while (purchases.pageInfo.hasNextPage);
  }

  return false;
}

async function requestPayment(session: SessionInterface) {
  const client = new Shopify.Clients.Graphql(session.shop, session.accessToken);
  const returnUrl = `https://${Shopify.Context.HOST_NAME}?shop=${
    session.shop
  }&host=${btoa(`${session.shop}/admin`)}`;

  let data;
  if (isRecurring(CONFIG.billing.interval!)) {
    const mutationResponse = await requestRecurringPayment(client, returnUrl);
    data = (mutationResponse.body as {[key: string]: any}).data.appSubscriptionCreate;
  } else {
    const mutationResponse = await requestSinglePayment(client, returnUrl);
    data = (mutationResponse.body as {[key: string]: any}).data.appPurchaseOneTimeCreate;
  }

  if (data.userErrors.length) {
    throw new Shopify.Errors.BillingError({
      message: "Error while billing the store",
      errorData: data.userErrors
    });
  }

  return data.confirmationUrl;
}

async function requestRecurringPayment(client: GraphqlClient, returnUrl: string) {
  const mutationResponse = await client.query({
    data: {
      query: RECURRING_PURCHASE_MUTATION,
      variables: {
        name: CONFIG.billing.chargeName,
        lineItems: [
          {
            plan: {
              appRecurringPricingDetails: {
                interval: CONFIG.billing.interval,
                price: {
                  amount: CONFIG.billing.amount,
                  currencyCode: CONFIG.billing.currencyCode,
                },
              },
            },
          },
        ],
        returnUrl,
        test: !isProd,
      },
    },
  });

  if ((mutationResponse.body as {[key: string]: any}).errors &&
    (mutationResponse.body as {[key: string]: any}).errors.length) {
    throw new Shopify.Errors.BillingError({
      message: "Error while billing the store",
      errorData: (mutationResponse.body as {[key: string]: any}).errors
    });
  }

  return mutationResponse;
}

async function requestSinglePayment(client: GraphqlClient, returnUrl: string) {
  const mutationResponse = await client.query({
    data: {
      query: ONE_TIME_PURCHASE_MUTATION,
      variables: {
        name: CONFIG.billing.chargeName,
        price: {
          amount: CONFIG.billing.amount,
          currencyCode: CONFIG.billing.currencyCode,
        },
        returnUrl,
        test: process.env.NODE_ENV !== "production",
      },
    },
  });

  if ((mutationResponse.body as {[key: string]: any}).errors &&
    (mutationResponse.body as {[key: string]: any}).errors.length) {
    throw new Shopify.Errors.BillingError({
      message: "Error while billing the store",
      errorData: (mutationResponse.body as {[key: string]: any}).errors
    });
  }

  return mutationResponse;
}

function isRecurring(interval: BillingInterval) {
  return RECURRING_INTERVALS.includes(interval);
}

const RECURRING_PURCHASES_QUERY = `
  query appSubscription {
    currentAppInstallation {
      activeSubscriptions {
        name, test
      }
    }
  }
`;

const ONE_TIME_PURCHASES_QUERY = `
  query appPurchases($endCursor: String) {
    currentAppInstallation {
      oneTimePurchases(first: 250, sortKey: CREATED_AT, after: $endCursor) {
        edges {
          node {
            name, test, status
          }
        }
        pageInfo {
          hasNextPage, endCursor
        }
      }
    }
  }
`;

const RECURRING_PURCHASE_MUTATION = `
  mutation test(
    $name: String!
    $lineItems: [AppSubscriptionLineItemInput!]!
    $returnUrl: URL!
    $test: Boolean
  ) {
    appSubscriptionCreate(
      name: $name
      lineItems: $lineItems
      returnUrl: $returnUrl
      test: $test
    ) {
      confirmationUrl
      userErrors {
        field
        message
      }
    }
  }
`;

const ONE_TIME_PURCHASE_MUTATION = `
  mutation test(
    $name: String!
    $price: MoneyInput!
    $returnUrl: URL!
    $test: Boolean
  ) {
    appPurchaseOneTimeCreate(
      name: $name
      price: $price
      returnUrl: $returnUrl
      test: $test
    ) {
      confirmationUrl
      userErrors {
        field
        message
      }
    }
  }
`;
