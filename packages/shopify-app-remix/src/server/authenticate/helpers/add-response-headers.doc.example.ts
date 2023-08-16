import shopify from './shopify.server';

export default async function handleRequest(
  request,
  responseStatusCode,
  responseHeaders,
  remixContext,
  loadContext,
) {
  shopify.addDocumentResponseHeaders(request, responseHeaders);

  // Respond to the request as any regular Remix app would.
}
