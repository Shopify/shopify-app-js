import type {LoaderFunctionArgs} from '@remix-run/node';

import {shopify} from '~/shopify.server';

export const loader = async ({request}: LoaderFunctionArgs) => {
  const result = shopify.newFeature(params);

  return null;
};
