import {shopifyApi} from '../..';
import {testConfig} from '../../__tests__/test-config';
import {ApiVersion} from '../../types';

describe('versionCompatible', () => {
  it('returns true if version is Unstable', () => {
    const shopify = shopifyApi(testConfig({apiVersion: ApiVersion.Unstable}));

    const result = shopify.utils.versionCompatible(ApiVersion.July25);

    expect(result).toBe(true);
  });

  it('returns true if version is equal to the configured one', () => {
    const shopify = shopifyApi(testConfig({apiVersion: ApiVersion.July25}));

    const result = shopify.utils.versionCompatible(ApiVersion.July25);

    expect(result).toBe(true);
  });

  it('returns true if version is newer than the configured one', () => {
    const shopify = shopifyApi(testConfig({apiVersion: ApiVersion.July25}));

    const result = shopify.utils.versionCompatible(ApiVersion.April25);

    expect(result).toBe(true);
  });

  it('returns false if version is older than the configured one', () => {
    const shopify = shopifyApi(testConfig({apiVersion: ApiVersion.April25}));

    const result = shopify.utils.versionCompatible(ApiVersion.July25);

    expect(result).toBe(false);
  });
});

describe('versionPriorTo', () => {
  it('returns false if version is Unstable (unstable is newer than any version)', () => {
    const shopify = shopifyApi(testConfig({apiVersion: ApiVersion.Unstable}));

    const result = shopify.utils.versionPriorTo(ApiVersion.July25);

    expect(result).toBe(false);
  });

  it('returns false if version is equal to the configured one', () => {
    const shopify = shopifyApi(testConfig({apiVersion: ApiVersion.July25}));

    const result = shopify.utils.versionPriorTo(ApiVersion.July25);

    expect(result).toBe(false);
  });

  it('returns false if version is newer than the configured one', () => {
    const shopify = shopifyApi(testConfig({apiVersion: ApiVersion.July25}));

    const result = shopify.utils.versionPriorTo(ApiVersion.April25);

    expect(result).toBe(false);
  });

  it('returns true if version is older than the configured one', () => {
    const shopify = shopifyApi(testConfig({apiVersion: ApiVersion.April25}));

    const result = shopify.utils.versionPriorTo(ApiVersion.July25);

    expect(result).toBe(true);
  });
});
