import {useRouteError} from 'react-router';
import {boundary} from '@shopify/shopify-app-remix';

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
