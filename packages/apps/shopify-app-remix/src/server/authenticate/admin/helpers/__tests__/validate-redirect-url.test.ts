import {ShopifyError} from '@shopify/shopify-api';

import {APP_URL} from '../../../../__test-helpers';
import {sanitizeRedirectUrl} from '../validate-redirect-url';

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
