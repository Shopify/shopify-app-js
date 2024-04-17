import {NavigateFunction} from '@remix-run/react';
import {getMissingScopesRedirection} from 'src/utils';

export function useShopifyFetcher(navigate: NavigateFunction) {
  async function submit(url: string, options: RequestInit) {
    const response = await fetch(url, options);
    const redirectionUrl = await getMissingScopesRedirection(response);
    if (redirectionUrl) navigate(redirectionUrl);
    return response;
  }

  return {submit};
}
