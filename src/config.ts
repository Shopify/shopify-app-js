import { ApiVersion, LATEST_API_VERSION } from "@shopify/shopify-api";
import { SessionStorage } from "@shopify/shopify-api/dist/auth/session";
import { BillingInterval } from "./helpers/ensure-billing";

// this is in shopify-api but needs to be exported to avoid re-use
type WebhookHandlerFunction = (
  topic: string,
  shop_domain: string,
  body: string,
) => Promise<void>;

export interface WebhookConfig {
  [key: string]: WebhookHandlerFunction
}

const GDPR_WEBHOOKS: WebhookConfig = {
  CUSTOMERS_DATA_REQUEST: async (_topic, _shop, _body) => {
    console.log(
      "The mandatory GDPR webhook CUSTOMERS_DATA_REQUEST is not implemented yet"
    );
  },
  CUSTOMERS_REDACT: async (_topic, _shop, _body) => {
    console.log(
      "The mandatory GDPR webhook CUSTOMERS_REDACT is not implemented yet"
    );
  },
  SHOP_REDACT: async (_topic, _shop, _body) => {
    console.log(
      "The mandatory GDPR webhook SHOP_REDACT is not implemented yet"
    );
  },
};

export interface ShopifyConfig {
  rootPath: string,
  apiKey: string | undefined,
  apiSecretKey: string | undefined,
  scopes: string[] | undefined,
  hostScheme: string | undefined,
  hostName: string | undefined,
  apiVersion: ApiVersion | undefined,
  useOnlineTokens: boolean,
  isEmbeddedApp: boolean,
  sessionStorage: SessionStorage | undefined,
  webhooks: WebhookConfig,
  billing: {
    required: boolean,
    chargeName: string | undefined,
    amount: string | undefined,
    currencyCode: string | undefined,
    interval: BillingInterval | undefined,
  },
  accessDeniedRedirect: ((req: any, res: any, next: any, url: string) => void) | undefined,
  userAgent: string | undefined,
}

export let CONFIG: ShopifyConfig = {
  rootPath: "",
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SCOPES?.split(","),
  hostScheme: process.env.HOST?.split("://")[0],
  hostName: process.env.HOST?.replace(/https?:\/\//, ""),
  apiVersion: LATEST_API_VERSION,
  useOnlineTokens: true,
  isEmbeddedApp: true,
  sessionStorage: undefined,
  webhooks: GDPR_WEBHOOKS,
  billing: {
    required: false,
    chargeName: undefined,
    amount: undefined,
    currencyCode: undefined,
    interval: undefined,
  },
  accessDeniedRedirect: undefined,
  userAgent: undefined,
};

/**
 * @param {typeof ShopifyConfig} config
 */
export function setConfig(config: ShopifyConfig): ShopifyConfig {
  config.webhooks = Object.assign({}, CONFIG.webhooks, config.webhooks);
  config.billing = Object.assign({}, CONFIG.billing, config.billing);

  if (config.rootPath) {
    config.rootPath = config.rootPath.replace(/\/$/, "");
  }

  CONFIG = Object.assign({}, CONFIG, config);

  return CONFIG;
}
