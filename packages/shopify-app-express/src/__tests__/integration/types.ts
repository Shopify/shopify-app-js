import {WebhookHandler} from '@shopify/shopify-api';

export interface CookiesType {
  [key: string]: string;
}

export interface CallbackInfo {
  params: URLSearchParams;
  cookies: string[];
}

export interface OAuthTestCase {
  embedded: boolean;
  online: boolean;
  host: string;
  existingWebhooks: boolean;
}

export interface AppUninstalledTestCase {
  handler: WebhookHandler;
  expectWrap: boolean;
  mockResponse: {[key: string]: any};
  expectedQuery: string;
}
