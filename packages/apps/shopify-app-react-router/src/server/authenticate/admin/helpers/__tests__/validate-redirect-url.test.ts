import {ShopifyError} from '@shopify/shopify-api';

import {APP_URL} from '../../../../__test-helpers';
import {
  isTrustedExitIframeDestination,
  sanitizeRedirectUrl,
} from '../validate-redirect-url';

describe('sanitizeRedirectUrlFactory', () => {
  it('throws ShopifyError with non-string types', () => {
    // THEN
    expect(() => sanitizeRedirectUrl(APP_URL, 123)).toThrow(ShopifyError);
  });

  it('throws ShopifyError with file URLs', () => {
    // THEN
    expect(() => sanitizeRedirectUrl(APP_URL, '///path/to/a/file')).toThrow(
      ShopifyError,
    );
  });

  it('throws ShopifyError if URL contains whitespaces', () => {
    // THEN
    expect(() =>
      sanitizeRedirectUrl(APP_URL, '/fine/url/but/it has spaces'),
    ).toThrow(ShopifyError);
  });

  it('throws ShopifyError with invalid URLs', () => {
    // THEN
    expect(() => sanitizeRedirectUrl('not a domain', '/valid/path')).toThrow(
      ShopifyError,
    );
  });

  it('throws ShopifyError with invalid relative URLs', () => {
    // THEN
    expect(() => sanitizeRedirectUrl(APP_URL, '/valid//path')).toThrow(
      ShopifyError,
    );
  });

  it('throws ShopifyError with invalid protocol', () => {
    // THEN
    expect(() =>
      sanitizeRedirectUrl(APP_URL, 'javascript:alert("nope")'),
    ).toThrow(ShopifyError);
  });

  it('throws ShopifyError when SSL is required and an HTTP address is given', () => {
    // THEN
    expect(() =>
      sanitizeRedirectUrl(APP_URL, 'http://example.com', {requireSSL: true}),
    ).toThrow(ShopifyError);
  });

  it('returns undefined if not set to throw', () => {
    // THEN
    expect(
      sanitizeRedirectUrl(APP_URL, 'http://example.com', {
        requireSSL: true,
        throwOnInvalid: false,
      }),
    ).toBeUndefined();
  });

  it('succeeds on a valid URL', () => {
    // THEN
    expect(
      sanitizeRedirectUrl(APP_URL, '/my/app/path', {requireSSL: true}),
    ).toEqual(new URL(`${APP_URL}/my/app/path`));
  });

  it('succeeds on a valid URL when not throwing', () => {
    // THEN
    expect(
      sanitizeRedirectUrl(APP_URL, '/my/app/path', {throwOnInvalid: false}),
    ).toEqual(new URL(`${APP_URL}/my/app/path`));
  });

  it('succeeds on a valid HTTP URL when not requiring SSL', () => {
    // THEN
    expect(
      sanitizeRedirectUrl(APP_URL, 'http://my/app/path', {requireSSL: false}),
    ).toEqual(new URL('http://my/app/path'));
  });
});

describe('isTrustedExitIframeDestination', () => {
  it.each([
    APP_URL,
    `${APP_URL}/some/path?query=1`,
    '/relative/path',
    'https://admin.shopify.com/store/test-shop/apps',
    'https://admin.shopify.com/store/test-shop/charges/1029266961/confirm',
    'https://test-shop.myshopify.com/admin',
    'https://test-shop.myshopify.com/admin/charges/1029266961/RcAbCdEf/confirm_recurring_application_charge?signature=abc123',
  ])('accepts trusted destination: %s', (destination) => {
    expect(isTrustedExitIframeDestination(APP_URL, destination)).toBe(true);
  });

  it.each([
    // Other origins.
    'https://not-the-app.example/elsewhere',
    'http://not-the-app.example',
    '//not-the-app.example',
    'https://shopify.com.not-the-app.example',
    // Other Shopify-owned hosts (storefront, CDN, community, accounts).
    'https://test-shop.myshopify.com',
    'https://test-shop.myshopify.com/',
    'https://some-store.myshopify.com/products',
    'https://test-shop.myshopify.com/adminlooking',
    'https://cdn.shopify.com/s/files/1/uploaded-file.html',
    'https://community.shopify.com/c/some-post',
    'https://accounts.shopify.com/login',
    'https://foo.shopify.com/bar',
    // Shopify admin host but not over https / on a custom port.
    'http://admin.shopify.com/store/test-shop/apps',
    'https://admin.shopify.com:8443/store/test-shop/apps',
    // Non-http protocols and empty values.
    'file:///etc/passwd',
    'javascript:alert(1)',
    '',
    '   ',
  ])('rejects untrusted destination: %s', (destination) => {
    expect(isTrustedExitIframeDestination(APP_URL, destination)).toBe(false);
  });

  it.each([undefined, null, 123, {}])(
    'rejects non-string destination: %s',
    (destination) => {
      expect(isTrustedExitIframeDestination(APP_URL, destination)).toBe(false);
    },
  );
});
