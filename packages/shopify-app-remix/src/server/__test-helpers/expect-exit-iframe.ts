import {APP_URL, BASE64_HOST, TEST_SHOP} from './const';

interface ExpectExitIframeRedirectOptions {
  shop?: string;
  host?: string | null;
  destination?: string;
}

export function expectExitIframeRedirect(
  response: Response,
  {
    shop = TEST_SHOP,
    host = BASE64_HOST,
    destination = `/auth?shop=${shop}`,
  }: ExpectExitIframeRedirectOptions = {},
) {
  expect(response.status).toBe(302);

  const {pathname, searchParams} = new URL(
    response.headers.get('location')!,
    APP_URL,
  );
  expect(pathname).toBe('/auth/exit-iframe');

  expect(searchParams.get('shop')).toBe(shop);
  expect(searchParams.get('exitIframe')).toBe(destination);

  if (host) {
    expect(searchParams.get('host')).toBe(host);
  }
}
