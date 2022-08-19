export * from "@shopify/shopify-api";

// This is still quite awkward - we'd need to figure out a good way of exporting the REST resources without needing to
// hard-code the API versions - although hard-coding them gives us _very_ nice intellisense capabilities.
export * from "@shopify/shopify-api/dist/rest-resources/2022-07";

export { setConfig } from "./config";
export { shopifyMiddleware } from "./middlewares/shopify";
export { BillingInterval } from "./helpers/ensure-billing";
