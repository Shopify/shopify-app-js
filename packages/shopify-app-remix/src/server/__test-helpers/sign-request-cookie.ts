import {getHmac} from './get-hmac';

export function signRequestCookie({
  request,
  cookieName,
  cookieValue,
}: {
  request: Request;
  cookieName: string;
  cookieValue: string;
}) {
  const signedCookieValue = getHmac(cookieValue);

  request.headers.set(
    'Cookie',
    [
      `${cookieName}=${cookieValue}`,
      `${cookieName}.sig=${signedCookieValue}`,
    ].join(';'),
  );
}
