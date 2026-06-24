import {
  Cookies,
  NormalizedRequest,
  NormalizedResponse,
} from '@shopify/shopify-api/runtime';

import {API_SECRET_KEY} from './const';

export async function signRequestCookie({
  request,
  cookieName,
  cookieValue,
}: {
  request: Request;
  cookieName: string;
  cookieValue: string;
}) {
  const cookies = new Cookies(
    {headers: {}} as NormalizedRequest,
    {} as NormalizedResponse,
    {keys: [API_SECRET_KEY]},
  );

  await cookies.setAndSign(cookieName, cookieValue);

  const cookieHeader = cookies
    .toHeaders()
    .map((cookie) => cookie.split(';')[0])
    .join(';');

  request.headers.set('Cookie', cookieHeader);
}
