import {APP_URL} from './const';

export function expectLoginRedirect(response: Response) {
  expect(response.status).toBe(302);

  const {pathname} = new URL(response.headers.get('location')!, APP_URL);
  expect(pathname).toBe('/auth/login');
}
