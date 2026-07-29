import {AccessTokenResponse, OnlineAccessResponse} from '@shopify/shopify-api';

export const OFFLINE_ACCESS_TOKEN_RESPONSE: AccessTokenResponse = {
  access_token: 'totally-real-access-token',
  scope: 'testScope',
};

export const ONLINE_ACCESS_TOKEN_RESPONSE: OnlineAccessResponse = {
  ...OFFLINE_ACCESS_TOKEN_RESPONSE,
  expires_in: 123456,
  associated_user_scope: 'testScope',
  associated_user: {
    id: 1234,
    first_name: 'first',
    last_name: 'last',
    email: 'email',
    email_verified: true,
    account_owner: true,
    locale: 'en',
    collaborator: true,
  },
};

export const EMPTY_WEBHOOK_RESPONSE = {
  data: {
    webhookSubscriptions: {
      edges: [],
      pageInfo: {
        endCursor: null,
        hasNextPage: false,
      },
    },
  },
};

export const EXISTING_WEBHOOK_RESPONSE = {
  data: {
    webhookSubscriptions: {
      edges: [
        {
          node: {
            id: 'fakeId',
            topic: 'TEST_TOPIC',
            includeFields: ['id'],
            endpoint: {
              __typename: 'WebhookHttpEndpoint',
              callbackUrl: 'https://test_host_name/test/webhooks',
            },
          },
        },
        {
          node: {
            id: 'fakeId',
            topic: 'TEST_TOPIC',
            includeFields: ['id'],
            endpoint: {
              __typename: 'WebhookEventBridgeEndpoint',
              arn: 'arn:test',
            },
          },
        },
        {
          node: {
            id: 'fakeId',
            topic: 'TEST_TOPIC',
            includeFields: ['id'],
            endpoint: {
              __typename: 'WebhookPubSubEndpoint',
              pubSubProject: 'pubSubProject',
              pubSubTopic: 'pubSubTopic',
            },
          },
        },
      ],
      pageInfo: {
        endCursor: null,
        hasNextPage: false,
      },
    },
  },
};

export const HTTP_WEBHOOK_CREATE_RESPONSE = {
  data: {
    webhookSubscriptionCreate: {
      webhookSubscription: {id: 'fakeId'},
      userErrors: [],
    },
  },
};

export const HTTP_WEBHOOK_UPDATE_RESPONSE = {
  data: {
    webhookSubscriptionUpdate: {
      webhookSubscription: {id: 'fakeId'},
      userErrors: [],
    },
  },
};

export const EVENT_BRIDGE_WEBHOOK_CREATE_RESPONSE = {
  data: {
    eventBridgeWebhookSubscriptionCreate: {
      webhookSubscription: {id: 'fakeId'},
      userErrors: [],
    },
  },
};

export const EVENT_BRIDGE_WEBHOOK_UPDATE_RESPONSE = {
  data: {
    eventBridgeWebhookSubscriptionUpdate: {
      webhookSubscription: {id: 'fakeId'},
      userErrors: [],
    },
  },
};

export const PUBSUB_WEBHOOK_CREATE_RESPONSE = {
  data: {
    pubSubWebhookSubscriptionCreate: {
      webhookSubscription: {id: 'fakeId'},
      userErrors: [],
    },
  },
};

export const PUBSUB_WEBHOOK_UPDATE_RESPONSE = {
  data: {
    pubSubWebhookSubscriptionUpdate: {
      webhookSubscription: {id: 'fakeId'},
      userErrors: [],
    },
  },
};

export const OFFLINE_TOKEN_EXCHANGE_RESPONSE = {
  access_token: 'offline-token-exchange-token',
  scope: 'testScope',
};

export const ONLINE_TOKEN_EXCHANGE_RESPONSE = {
  access_token: 'online-token-exchange-token',
  scope: 'testScope',
  expires_in: 123456,
  associated_user_scope: 'testScope',
  associated_user: {
    id: 1234,
    first_name: 'first',
    last_name: 'last',
    email: 'email',
    email_verified: true,
    account_owner: true,
    locale: 'en',
    collaborator: true,
  },
};

export const EXPIRING_OFFLINE_TOKEN_EXCHANGE_RESPONSE = {
  access_token: 'expiring-offline-token',
  scope: 'testScope',
  expires_in: 86400,
  refresh_token: 'refresh-token-value',
  refresh_token_expires_in: 604800,
};

export const REFRESH_TOKEN_RESPONSE = {
  access_token: 'refreshed-access-token',
  scope: 'testScope',
  expires_in: 86400,
  refresh_token: 'new-refresh-token',
  refresh_token_expires_in: 604800,
};
