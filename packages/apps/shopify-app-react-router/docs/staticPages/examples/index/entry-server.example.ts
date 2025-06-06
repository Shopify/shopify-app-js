import shopify from './shopify.server';

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext,
) {
  shopify.addDocumentResponseHeaders(request, responseHeaders);

  // ..etc
}
