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

export interface AppUninstalledtestCase {
  handler: WebhookConfigHandler;
  expectWrap: boolean;
  mockResponse: {[key: string]: any};
  expectedQuery: string;
}
