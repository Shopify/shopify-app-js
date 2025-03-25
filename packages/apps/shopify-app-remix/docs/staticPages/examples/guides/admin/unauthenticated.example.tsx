// /background-jobs/**/*.ts
import { unauthenticated } from "../shopify.server";

// Background job set up

const shop = 'mystore.myshopify.com'
const { admin } = await unauthenticated.admin(shop);

const response = await admin.graphql(
  `#graphql
    mutation populateProduct($input: ProductInput!) {
      productCreate(input: $input) {
        product {
          id
        }
      }
    }
  `,
  { variables: { input: { title: "Product Name" } } }
);

const productData = await response.json();

// Background job complete