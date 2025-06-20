import type {HeadersFunction, LoaderFunctionArgs} from 'react-router';
import {authenticate} from '../shopify.server';
import {boundary} from '@shopify/shopify-app-react-router/server';

export const loader = async ({request}: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return null;
};

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};