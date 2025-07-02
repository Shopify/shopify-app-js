import type {LoaderFunctionArgs} from 'react-router';

import {shopify} from '~/shopify.server';

export const loader = async ({request}: LoaderFunctionArgs) => {
  const result = shopify.newFeature(params);

  return null;
};
