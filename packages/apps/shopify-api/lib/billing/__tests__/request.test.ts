import {queueMockResponses} from '../../__tests__/test-helper';
import {testConfig} from '../../__tests__/test-config';
import {Session} from '../../session/session';
import {BillingError} from '../../error';
import {BillingInterval, BillingReplacementBehavior} from '../../types';
import {BillingConfig} from '../types';
import {shopifyApi} from '../..';
import {
  DOMAIN,
  ACCESS_TOKEN,
  GRAPHQL_BASE_REQUEST,
} from '../../__test-helpers__';

import * as Responses from './responses';

interface TestConfigInterface {
  name: string;
  billingConfig: BillingConfig;
  paymentResponse: string;
  responseObject: any;
  errorResponse: string;
  mutationName: string;
}

const TEST_CONFIGS: TestConfigInterface[] = [
  {
    name: 'non-recurring config',
    billingConfig: {
      [Responses.PLAN_1]: {
        amount: 5,
        currencyCode: 'USD',
        interval: BillingInterval.OneTime,
      },
      [Responses.PLAN_2]: {
        amount: 10,
        currencyCode: 'USD',
        interval: BillingInterval.OneTime,
      },
    },
    paymentResponse: Responses.PURCHASE_ONE_TIME_RESPONSE,
    responseObject: JSON.parse(Responses.PURCHASE_ONE_TIME_RESPONSE).data
      .appPurchaseOneTimeCreate,
    errorResponse: Responses.PURCHASE_ONE_TIME_RESPONSE_WITH_USER_ERRORS,
    mutationName: 'appPurchaseOneTimeCreate',
  },
  {
    name: 'recurring config',
    billingConfig: {
      [Responses.PLAN_1]: {
        lineItems: [
          {
            amount: 5,
            currencyCode: 'USD',
            interval: BillingInterval.Every30Days,
          },
        ],
      },
      [Responses.PLAN_2]: {
        lineItems: [
          {
            amount: 10,
            currencyCode: 'USD',
            interval: BillingInterval.Every30Days,
          },
        ],
      },
    },
    paymentResponse: Responses.PURCHASE_SUBSCRIPTION_RESPONSE,
    responseObject: JSON.parse(Responses.PURCHASE_SUBSCRIPTION_RESPONSE).data
      .appSubscriptionCreate,
    errorResponse: Responses.PURCHASE_SUBSCRIPTION_RESPONSE_WITH_USER_ERRORS,
    mutationName: 'appSubscriptionCreate',
  },
  {
    name: 'usage config',
    billingConfig: {
      [Responses.PLAN_1]: {
        lineItems: [
          {
            amount: 5,
            currencyCode: 'USD',
            terms: '1 dollar per click',
            interval: BillingInterval.Usage,
          },
        ],
      },
      [Responses.PLAN_2]: {
        lineItems: [
          {
            amount: 10,
            currencyCode: 'USD',
            terms: '1 dollar per email',
            interval: BillingInterval.Usage,
          },
        ],
      },
    },
    paymentResponse: Responses.PURCHASE_SUBSCRIPTION_RESPONSE,
    responseObject: JSON.parse(Responses.PURCHASE_SUBSCRIPTION_RESPONSE).data
      .appSubscriptionCreate,
    errorResponse: Responses.PURCHASE_SUBSCRIPTION_RESPONSE_WITH_USER_ERRORS,
    mutationName: 'appSubscriptionCreate',
  },
  {
    name: 'subscription with line items',
    billingConfig: {
      [Responses.PLAN_1]: {
        replacementBehavior: BillingReplacementBehavior.ApplyImmediately,
        trialDays: 7,
        lineItems: [
          {
            interval: BillingInterval.Every30Days,
            amount: 30,
            currencyCode: 'USD',
            discount: {
              durationLimitInIntervals: 3,
              value: {
                amount: 10,
              },
            },
          },
          {
            interval: BillingInterval.Usage,
            amount: 30,
            currencyCode: 'USD',
            terms: 'per 1000 emails',
          },
        ],
      },
      [Responses.PLAN_2]: {
        replacementBehavior: BillingReplacementBehavior.ApplyImmediately,
        trialDays: 7,
        lineItems: [
          {
            interval: BillingInterval.Every30Days,
            amount: 40,
            currencyCode: 'USD',
          },
          {
            interval: BillingInterval.Usage,
            amount: 30,
            currencyCode: 'USD',
            terms: 'per 1000 emails',
          },
        ],
      },
    },
    paymentResponse: Responses.PURCHASE_SUBSCRIPTION_RESPONSE,
    responseObject: JSON.parse(Responses.PURCHASE_SUBSCRIPTION_RESPONSE).data
      .appSubscriptionCreate,
    errorResponse: Responses.PURCHASE_SUBSCRIPTION_RESPONSE_WITH_USER_ERRORS,
    mutationName: 'appSubscriptionCreate',
  },
  {
    name: 'subscription with line items',
    billingConfig: {
      [Responses.PLAN_1]: {
        replacementBehavior: BillingReplacementBehavior.ApplyImmediately,
        trialDays: 7,
        lineItems: [
          {
            interval: BillingInterval.Every30Days,
            amount: 30,
            currencyCode: 'USD',
            discount: {
              durationLimitInIntervals: 3,
              value: {
                amount: 10,
              },
            },
          },
          {
            interval: BillingInterval.Usage,
            amount: 30,
            currencyCode: 'USD',
            terms: 'per 1000 emails',
          },
        ],
      },
      [Responses.PLAN_2]: {
        replacementBehavior: BillingReplacementBehavior.ApplyImmediately,
        trialDays: 7,
        lineItems: [
          {
            interval: BillingInterval.Every30Days,
            amount: 40,
            currencyCode: 'USD',
          },
          {
            interval: BillingInterval.Usage,
            amount: 30,
            currencyCode: 'USD',
            terms: 'per 1000 emails',
          },
        ],
      },
    },
    paymentResponse: Responses.PURCHASE_SUBSCRIPTION_RESPONSE,
    responseObject: JSON.parse(Responses.PURCHASE_SUBSCRIPTION_RESPONSE).data
      .appSubscriptionCreate,
    errorResponse: Responses.PURCHASE_SUBSCRIPTION_RESPONSE_WITH_USER_ERRORS,
    mutationName: 'appSubscriptionCreate',
  },
];

const SUBSCRIPTION_TEST_CONFIGS: TestConfigInterface[] = [
  {
    name: 'can request subscription with extra fields',
    billingConfig: {
      [Responses.PLAN_1]: {
        replacementBehavior: BillingReplacementBehavior.ApplyImmediately,
        trialDays: 10,
        lineItems: [
          {
            interval: BillingInterval.Every30Days,
            amount: 5,
            currencyCode: 'USD',
          },
        ],
      },
    },
    paymentResponse: Responses.PURCHASE_SUBSCRIPTION_RESPONSE,
    responseObject: JSON.parse(Responses.PURCHASE_SUBSCRIPTION_RESPONSE).data
      .appSubscriptionCreate,
    errorResponse: '',
    mutationName: 'appSubscriptionCreate',
  },
  {
    name: 'can request subscription with discount amount fields',
    billingConfig: {
      [Responses.PLAN_1]: {
        replacementBehavior: BillingReplacementBehavior.ApplyImmediately,
        trialDays: 10,
        amount: 5,
        lineItems: [
          {
            interval: BillingInterval.Every30Days,
            amount: 5,
            currencyCode: 'USD',
            discount: {
              durationLimitInIntervals: 5,
              value: {
                amount: 2,
              },
            },
          },
        ],
      },
    },
    paymentResponse: Responses.PURCHASE_SUBSCRIPTION_RESPONSE,
    responseObject: JSON.parse(Responses.PURCHASE_SUBSCRIPTION_RESPONSE).data
      .appSubscriptionCreate,
    errorResponse: '',
    mutationName: 'appSubscriptionCreate',
  },
  {
    name: 'can request subscription with discount percentage fields',
    billingConfig: {
      [Responses.PLAN_1]: {
        replacementBehavior: BillingReplacementBehavior.ApplyImmediately,
        trialDays: 10,
        lineItems: [
          {
            amount: 5,
            currencyCode: 'USD',
            interval: BillingInterval.Every30Days,
            discount: {
              durationLimitInIntervals: 5,
              value: {
                percentage: 0.2,
              },
            },
          },
        ],
      },
    },
    paymentResponse: Responses.PURCHASE_SUBSCRIPTION_RESPONSE,
    responseObject: JSON.parse(Responses.PURCHASE_SUBSCRIPTION_RESPONSE).data
      .appSubscriptionCreate,
    errorResponse: '',
    mutationName: 'appSubscriptionCreate',
  },
  {
    name: 'can request usage subscription with extra fields',
    billingConfig: {
      [Responses.PLAN_1]: {
        replacementBehavior: BillingReplacementBehavior.ApplyImmediately,
        trialDays: 10,
        lineItems: [
          {
            amount: 5,
            currencyCode: 'USD',
            interval: BillingInterval.Usage,
            terms: '1 dollar per click',
          },
        ],
      },
    },
    paymentResponse: Responses.PURCHASE_SUBSCRIPTION_RESPONSE,
    responseObject: JSON.parse(Responses.PURCHASE_SUBSCRIPTION_RESPONSE).data
      .appSubscriptionCreate,
    errorResponse: '',
    mutationName: 'appSubscriptionCreate',
  },
];

describe('shopify.billing.request', () => {
  const session = new Session({
    id: '1234',
    shop: DOMAIN,
    state: '1234',
    isOnline: true,
    accessToken: ACCESS_TOKEN,
    scope: 'write_products',
  });

  describe('with no billing config', () => {
    test('throws error', async () => {
      const shopify = shopifyApi(testConfig({billing: undefined}));

      expect(() =>
        shopify.billing.request({
          session,
          plan: Responses.PLAN_1,
          isTest: true,
        }),
      ).rejects.toThrowError(BillingError);
    });
  });

  [true, false].forEach((returnObject) => {
    describe(`returning ${
      returnObject ? 'response object' : 'confirmationUrl'
    }`, () => {
      TEST_CONFIGS.forEach((config) => {
        describe(`with ${config.name}`, () => {
          [true, false].forEach((isTest) =>
            test(`can request payment (isTest: ${isTest})`, async () => {
              const shopify = shopifyApi(
                testConfig({
                  billing: config.billingConfig,
                }),
              );

              queueMockResponses([config.paymentResponse]);

              const response = await shopify.billing.request({
                session,
                plan: Responses.PLAN_1,
                isTest,
                returnObject,
              });

              if (returnObject) {
                expect(response).toMatchObject(config.responseObject);
              } else {
                expect(response).toBe(Responses.CONFIRMATION_URL);
              }
              expect({
                ...GRAPHQL_BASE_REQUEST,
                data: {
                  query: expect.stringContaining(config.mutationName),
                  variables: expect.objectContaining({
                    test: isTest,
                    returnUrl: `https://test_host_name?shop=${DOMAIN}`,
                  }),
                },
              }).toMatchMadeHttpRequest();
            }),
          );

          test(`can request payment with returnUrl param`, async () => {
            const shopify = shopifyApi(
              testConfig({billing: config.billingConfig}),
            );

            queueMockResponses([config.paymentResponse]);

            const response = await shopify.billing.request({
              session,
              plan: Responses.PLAN_1,
              isTest: true,
              returnUrl: 'https://example.com',
              returnObject,
            });

            if (returnObject) {
              expect(response).toMatchObject(config.responseObject);
            } else {
              expect(response).toBe(Responses.CONFIRMATION_URL);
            }
            expect({
              ...GRAPHQL_BASE_REQUEST,
              data: {
                query: expect.stringContaining(config.mutationName),
                variables: expect.objectContaining({
                  test: true,
                  returnUrl: 'https://example.com',
                }),
              },
            }).toMatchMadeHttpRequest();
          });

          test('defaults to test purchases', async () => {
            const shopify = shopifyApi(
              testConfig({billing: config.billingConfig}),
            );

            queueMockResponses([config.paymentResponse]);

            const response = await shopify.billing.request({
              session,
              plan: Responses.PLAN_1,
              returnObject,
            });

            if (returnObject) {
              expect(response).toMatchObject(config.responseObject);
            } else {
              expect(response).toBe(Responses.CONFIRMATION_URL);
            }
            expect({
              ...GRAPHQL_BASE_REQUEST,
              data: {
                query: expect.stringContaining(config.mutationName),
                variables: expect.objectContaining({test: true}),
              },
            }).toMatchMadeHttpRequest();
          });

          test('can request multiple plans', async () => {
            const shopify = shopifyApi(
              testConfig({billing: config.billingConfig}),
            );

            queueMockResponses(
              [config.paymentResponse],
              [config.paymentResponse],
            );

            const response1 = await shopify.billing.request({
              session,
              plan: Responses.PLAN_1,
              returnObject,
            });

            if (returnObject) {
              expect(response1).toMatchObject(config.responseObject);
            } else {
              expect(response1).toBe(Responses.CONFIRMATION_URL);
            }
            expect({
              ...GRAPHQL_BASE_REQUEST,
              data: {
                query: expect.stringContaining(config.mutationName),
                variables: expect.objectContaining({
                  name: Responses.PLAN_1,
                }),
              },
            }).toMatchMadeHttpRequest();

            const response2 = await shopify.billing.request({
              session,
              plan: Responses.PLAN_2,
              returnObject,
            });

            if (returnObject) {
              expect(response2).toMatchObject(config.responseObject);
            } else {
              expect(response2).toBe(Responses.CONFIRMATION_URL);
            }
            expect({
              ...GRAPHQL_BASE_REQUEST,
              data: {
                query: expect.stringContaining(config.mutationName),
                variables: expect.objectContaining({
                  name: Responses.PLAN_2,
                }),
              },
            }).toMatchMadeHttpRequest();
          });

          test('throws on userErrors', async () => {
            const shopify = shopifyApi(
              testConfig({billing: config.billingConfig}),
            );

            queueMockResponses([config.errorResponse]);

            await expect(() =>
              shopify.billing.request({
                session,
                plan: Responses.PLAN_1,
                isTest: true,
                returnObject,
              }),
            ).rejects.toThrow(BillingError);

            expect({
              ...GRAPHQL_BASE_REQUEST,
              data: expect.stringContaining(config.mutationName),
            }).toMatchMadeHttpRequest();
          });
        });
      });

      SUBSCRIPTION_TEST_CONFIGS.forEach((config) => {
        describe(`subscription tests`, () => {
          test(`${config.name}`, async () => {
            const shopify = shopifyApi(
              testConfig({billing: config.billingConfig}),
            );

            queueMockResponses([config.paymentResponse]);

            const response = await shopify.billing.request({
              session,
              plan: Responses.PLAN_1,
              returnObject,
            });

            if (returnObject) {
              expect(response).toMatchObject(config.responseObject);
            } else {
              expect(response).toBe(Responses.CONFIRMATION_URL);
            }
            expect({
              ...GRAPHQL_BASE_REQUEST,
              data: {
                query: expect.stringContaining(config.mutationName),
                variables: expect.objectContaining({
                  trialDays: 10,
                  replacementBehavior:
                    BillingReplacementBehavior.ApplyImmediately,
                }),
              },
            }).toMatchMadeHttpRequest();
          });
        });
      });
    });
  });

  describe('billing config overrides', () => {
    it.each([
      {
        test: 'trial days',
        plan: Responses.PLAN_1,
        field: 'trialDays',
        value: 20,
        expected: '"trialDays":20',
      },
      {
        test: 'amount',
        plan: Responses.PLAN_1,
        field: 'lineItems',
        value: [{interval: BillingInterval.Every30Days, amount: 10}],
        expected: '"amount":10',
      },
      {
        test: 'currency',
        plan: Responses.PLAN_1,
        field: 'lineItems',
        value: [{interval: BillingInterval.Every30Days, currencyCode: 'CAD'}],
        expected: '"currencyCode":"CAD"',
      },
      {
        test: 'replacement behavior',
        plan: Responses.PLAN_1,
        field: 'replacementBehavior',
        value: BillingReplacementBehavior.ApplyImmediately,
        expected: '"replacementBehavior":"APPLY_IMMEDIATELY"',
      },
      {
        test: 'usage terms',
        plan: Responses.PLAN_2,
        field: 'lineItems',
        value: [
          {
            interval: BillingInterval.Usage,
            terms: 'Different usage terms',
          },
        ],
        expected: '"terms":"Different usage terms"',
      },
      {
        test: 'discount',
        plan: Responses.PLAN_1,
        field: 'lineItems',
        value: [
          {
            interval: BillingInterval.Every30Days,
            discount: {durationLimitInIntervals: 10, value: {amount: 2}},
          },
        ],
        expected:
          '"discount":{"durationLimitInIntervals":10,"value":{"amount":2}}',
      },
    ])(
      'applies override when setting $test',
      async ({plan, field, value, expected}) => {
        const shopify = shopifyApi(
          testConfig({
            billing: {
              [Responses.PLAN_1]: {
                replacementBehavior:
                  BillingReplacementBehavior.ApplyImmediately,
                trialDays: 10,
                lineItems: [
                  {
                    interval: BillingInterval.Every30Days,
                    amount: 5,
                    currencyCode: 'USD',
                    discount: {durationLimitInIntervals: 5, value: {amount: 2}},
                  },
                ],
              },
              [Responses.PLAN_2]: {
                replacementBehavior:
                  BillingReplacementBehavior.ApplyImmediately,
                trialDays: 10,
                lineItems: [
                  {
                    interval: BillingInterval.Usage,
                    amount: 5,
                    currencyCode: 'USD',
                    terms: 'Usage terms',
                  },
                ],
              },
            },
          }),
        );

        queueMockResponses([Responses.PURCHASE_SUBSCRIPTION_RESPONSE]);

        await shopify.billing.request({
          session,
          plan,
          returnObject: true,
          [field]: value,
        });

        expect({
          ...GRAPHQL_BASE_REQUEST,
          data: expect.stringContaining(expected),
        }).toMatchMadeHttpRequest();
      },
    );

    it('applies a trialDays override of 0', async () => {
      const shopify = shopifyApi(
        testConfig({
          billing: {
            [Responses.PLAN_1]: {
              replacementBehavior: BillingReplacementBehavior.ApplyImmediately,
              trialDays: 10,
              lineItems: [
                {
                  amount: 5,
                  currencyCode: 'USD',
                  interval: BillingInterval.Every30Days,
                },
              ],
            },
          },
        }),
      );

      queueMockResponses([Responses.PURCHASE_SUBSCRIPTION_RESPONSE]);

      await shopify.billing.request({
        session,
        plan: Responses.PLAN_1,
        returnObject: true,
        trialDays: 0,
      });

      expect({
        ...GRAPHQL_BASE_REQUEST,
        data: {
          query: expect.stringContaining('appSubscriptionCreate'),
          variables: expect.objectContaining({
            trialDays: 0,
          }),
        },
      }).toMatchMadeHttpRequest();
    });

    it("ignores overrides if they're undefined", async () => {
      const shopify = shopifyApi(
        testConfig({
          billing: {
            [Responses.PLAN_1]: {
              replacementBehavior: BillingReplacementBehavior.ApplyImmediately,
              trialDays: 10,
              lineItems: [
                {
                  amount: 5,
                  currencyCode: 'USD',
                  interval: BillingInterval.Every30Days,
                },
              ],
            },
          },
        }),
      );

      queueMockResponses([Responses.PURCHASE_SUBSCRIPTION_RESPONSE]);

      await shopify.billing.request({
        session,
        plan: Responses.PLAN_1,
        returnObject: true,
        trialDays: undefined,
      });

      expect({
        ...GRAPHQL_BASE_REQUEST,
        data: {
          query: expect.stringContaining('appSubscriptionCreate'),
          variables: expect.objectContaining({
            trialDays: 10,
          }),
        },
      }).toMatchMadeHttpRequest();
    });
  });
});
