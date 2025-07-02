import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.January25,
  appUrl: process.env.SHOPIFY_APP_URL || "",
  // use Prisma session storage
  sessionStorage: new PrismaSessionStorage(prisma),
});

export const sessionStorage = shopify.sessionStorage;
