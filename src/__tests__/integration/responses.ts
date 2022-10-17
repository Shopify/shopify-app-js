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
  data: {webhookSubscriptions: {edges: []}},
};

export const EXISTING_HTTP_WEBHOOK_RESPONSE = {
  data: {
    webhookSubscriptions: {
      edges: [
        {
          node: {
            id: 'fakeId',
            endpoint: {
              __typename: 'WebhookHttpEndpoint',
              callbackUrl: 'https://test_host_name/old-webhooks',
            },
          },
        },
      ],
    },
  },
};

export const EXISTING_EVENT_BRIDGE_WEBHOOK_RESPONSE = {
  data: {
    webhookSubscriptions: {
      edges: [
        {
          node: {
            id: 'fakeId',
            endpoint: {
              __typename: 'WebhookEventBridgeEndpoint',
              arn: 'old-eventbridge-address',
            },
          },
        },
      ],
    },
  },
};

export const EXISTING_PUBSUB_WEBHOOK_RESPONSE = {
  data: {
    webhookSubscriptions: {
      edges: [
        {
          node: {
            id: 'fakeId',
            endpoint: {
              __typename: 'WebhookPubSubEndpoint',
              pubSubProject: 'old-pubsub',
              pubSubTopic: 'address',
            },
          },
        },
      ],
    },
  },
};

export const HTTP_WEBHOOK_CREATE_RESPONSE = {
  data: {
    webhookSubscriptionCreate: {webhookSubscription: {id: 'fakeId'}},
  },
};

export const HTTP_WEBHOOK_UPDATE_RESPONSE = {
  data: {
    webhookSubscriptionUpdate: {webhookSubscription: {id: 'fakeId'}},
  },
};

export const EVENT_BRIDGE_WEBHOOK_CREATE_RESPONSE = {
  data: {
    eventBridgeWebhookSubscriptionCreate: {
      webhookSubscription: {id: 'fakeId'},
    },
  },
};

export const EVENT_BRIDGE_WEBHOOK_UPDATE_RESPONSE = {
  data: {
    eventBridgeWebhookSubscriptionUpdate: {
      webhookSubscription: {id: 'fakeId'},
    },
  },
};

export const PUBSUB_WEBHOOK_CREATE_RESPONSE = {
  data: {
    pubSubWebhookSubscriptionCreate: {
      webhookSubscription: {id: 'fakeId'},
    },
  },
};

export const PUBSUB_WEBHOOK_UPDATE_RESPONSE = {
  data: {
    pubSubWebhookSubscriptionUpdate: {
      webhookSubscription: {id: 'fakeId'},
    },
  },
};
