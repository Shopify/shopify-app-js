import {Request as Req} from '@shopify/shopify-app-js';

export function toReq(request: Request): Req {
  return {
    method: request.method,
    url: request.url,
    headers: Object.fromEntries(request.headers.entries()),
    body: request.body?.toString() || '',
  };
}
