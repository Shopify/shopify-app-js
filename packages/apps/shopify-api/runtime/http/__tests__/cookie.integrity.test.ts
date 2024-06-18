import {createSHA256HMAC} from '../../crypto';
import {Cookies} from '../cookies';

jest.mock('../crypto/utils', () => ({
  createSHA256HMAC: jest.fn(),
}));

describe('Cookies', () => {
  describe('isSignedCookieValid', () => {
    let cookies: Cookies;
    let request: any;
    let response: any;
    const keys = ['key1', 'key2'];

    beforeEach(() => {
      request = {headers: {}};
      response = {headers: {}};
      cookies = new Cookies(request, response, {keys});

      cookies.get = jest.fn();
      cookies.deleteCookie = jest.fn();
    });

    it('should return false if cookies are not set', async () => {
      (cookies.get as jest.Mock).mockReturnValue(undefined);

      const result = await cookies.isSignedCookieValid('testCookie');

      expect(result).toBe(false);
      expect(cookies.deleteCookie).toHaveBeenCalledWith('testCookie.sig');
      expect(cookies.deleteCookie).toHaveBeenCalledWith('testCookie');
    });

    it('should return false if cookies are set but empty values', async () => {
      (cookies.get as jest.Mock).mockImplementation((name) =>
        name === 'testCookie' ? '' : 'validSignature',
      );

      const result = await cookies.isSignedCookieValid('testCookie');

      expect(result).toBe(false);
      expect(cookies.deleteCookie).toHaveBeenCalledWith('testCookie.sig');
      expect(cookies.deleteCookie).toHaveBeenCalledWith('testCookie');
    });

    it('should return false if signature does not match', async () => {
      (cookies.get as jest.Mock).mockImplementation((name) => {
        if (name === 'testCookie') return 'cookieValue';
        if (name === 'testCookie.sig') return 'invalidSignature';
        return undefined;
      });

      (createSHA256HMAC as jest.Mock).mockResolvedValue('validSignature');

      const result = await cookies.isSignedCookieValid('testCookie');

      expect(result).toBe(false);
      expect(cookies.deleteCookie).toHaveBeenCalledWith('testCookie.sig');
      expect(cookies.deleteCookie).toHaveBeenCalledWith('testCookie');
    });

    it('should return true if signature matches', async () => {
      (cookies.get as jest.Mock).mockImplementation((name) => {
        if (name === 'testCookie') return 'cookieValue';
        if (name === 'testCookie.sig') return 'validSignature';
        return undefined;
      });

      (createSHA256HMAC as jest.Mock).mockResolvedValue('validSignature');

      const result = await cookies.isSignedCookieValid('testCookie');

      expect(result).toBe(true);
      expect(cookies.deleteCookie).not.toHaveBeenCalled();
    });

    it('should return false if either cookie or signature is missing after initial check', async () => {
      (cookies.get as jest.Mock).mockImplementation((name) => {
        if (name === 'testCookie') return 'cookieValue';
        return undefined;
      });

      const result = await cookies.isSignedCookieValid('testCookie');

      expect(result).toBe(false);
      expect(cookies.deleteCookie).toHaveBeenCalledWith('testCookie.sig');
      expect(cookies.deleteCookie).toHaveBeenCalledWith('testCookie');
    });

    it('should handle multiple keys correctly', async () => {
      (cookies.get as jest.Mock).mockImplementation((name) => {
        if (name === 'testCookie') return 'cookieValue';
        if (name === 'testCookie.sig') return 'validSignature';
        return undefined;
      });

      (createSHA256HMAC as jest.Mock)
        .mockResolvedValueOnce('validSignature')
        .mockResolvedValueOnce('otherSignature');

      const result = await cookies.isSignedCookieValid('testCookie');

      expect(result).toBe(true);
      expect(createSHA256HMAC).toHaveBeenCalledTimes(2);
      expect(cookies.deleteCookie).not.toHaveBeenCalled();
    });
  });
});
