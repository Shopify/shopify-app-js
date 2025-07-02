import {
  LATEST_API_VERSION,
  LogSeverity,
  shopifyApp,
} from '@shopify/shopify-app-react-router/server';

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_API_SECRET!,
  appUrl: process.env.SHOPIFY_APP_URL!,
  apiVersion: LATEST_API_VERSION,
  logger: {
    level: LogSeverity.Debug, // Set the log level to debug
  },
  future: {
    exampleFlag: true, // Enable a future flag to true
  },
});
export default shopify;
