import {HeadersArgs} from '@remix-run/server-runtime';

export function headersBoundary(headers: HeadersArgs): Headers {
  const {parentHeaders, loaderHeaders, actionHeaders, errorHeaders} = headers;

  if (errorHeaders && Array.from(errorHeaders.entries()).length > 0) {
    return errorHeaders;
  }

  return new Headers([
    ...(parentHeaders ? Array.from(parentHeaders.entries()) : []),
    ...(loaderHeaders ? Array.from(loaderHeaders.entries()) : []),
    ...(actionHeaders ? Array.from(actionHeaders.entries()) : []),
  ]);
}
