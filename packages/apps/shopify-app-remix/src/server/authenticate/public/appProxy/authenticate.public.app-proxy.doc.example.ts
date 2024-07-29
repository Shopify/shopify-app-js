import type {LoaderFunctionArgs} from '@remix-run/node';

import {authenticate} from '../shopify.server';

export const loader = async ({request}: LoaderFunctionArgs) => {
  const {storefront, liquid} = await authenticate.public.appProxy(request);

  if (!storefront) {
    return new Response();
  }

  const response = await storefront.graphql(
    `#graphql
    query productTitle {
      products(first: 1) {
        nodes {
          title
        }
      }
    }`,
  );
  const body = await response.json();

  const title = body.data.products.nodes[0].title;

  return liquid(`Found product ${title} from {{shop.name}}`);
};
