import {request as httpRequest} from 'http';
import {request as httpsRequest} from 'https';
import type {OutgoingHttpHeaders} from 'http';

/**
 * A fetch replacement that uses Node's http/https modules for localhost requests
 * to work around Node v20 fetch localhost issues.
 * Real apps would not encounter these issues since real apps don't make localhost requests.
 * They request to Shopify instead, which isn't running on localhost.
 * In our E2E tests we make requests to localhost to simulate Shopify.
 */
export function nodeLocalhostFetch(
  url: string | URL,
  init?: RequestInit,
): Promise<Response> {
  const urlObj = typeof url === 'string' ? new URL(url) : url;

  return new Promise((resolve, reject) => {
    const isHttps = urlObj.protocol === 'https:';
    const request = isHttps ? httpsRequest : httpRequest;

    // Convert HeadersInit to OutgoingHttpHeaders
    let headers: OutgoingHttpHeaders = {};
    if (init?.headers) {
      if (init.headers instanceof Headers) {
        init.headers.forEach((value, key) => {
          headers[key] = value;
        });
      } else if (Array.isArray(init.headers)) {
        init.headers.forEach(([key, value]) => {
          headers[key] = value;
        });
      } else {
        headers = init.headers as OutgoingHttpHeaders;
      }
    }

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: init?.method || 'GET',
      headers,
    };

    const req = request(options, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const body = Buffer.concat(chunks);
        const response = new Response(body, {
          status: res.statusCode,
          statusText: res.statusMessage,
          headers: res.headers as any,
        });
        resolve(response);
      });
    });

    req.on('error', reject);

    if (init?.body) {
      req.write(init.body);
    }

    req.end();
  });
}
