import {TEST_SHOP} from './const';
import {testConfig} from './test-config';

export function expectBeginAuthRedirect(
  config: ReturnType<typeof testConfig>,
  response: Response,
) {
  expect(response.status).toEqual(302);

  const {hostname, pathname, searchParams} = new URL(
    response.headers.get('location')!,
  );

  expect(hostname).toBe(TEST_SHOP);
  expect(pathname).toBe('/admin/oauth/authorize');
  expect(searchParams.get('client_id')).toBe(config.apiKey);
  expect(searchParams.get('scope')).toBe(config.scopes!.toString());
  expect(searchParams.get('redirect_uri')).toBe(
    `${config.appUrl}/auth/callback`,
  );
  expect(searchParams.get('state')).toStrictEqual(expect.any(String));
}
