import {boundary} from '../index';
import {shopifyApp} from '../../index';
import {testConfig} from '../../__tests__/test-helper';

describe('Headers boundary', () => {
  it('returns only error headers if error headers are present', () => {
    // GIVEN
    const shopify = shopifyApp(testConfig());
    const headers = {
      parentHeaders: new Headers([['parent', 'header']]),
      loaderHeaders: new Headers([['loader', 'header']]),
      actionHeaders: new Headers([['action', 'header']]),
      errorHeaders: new Headers([['error', 'header']]),
    };

    // WHEN
    const result = boundary.headers(headers);

    // THEN
    expect(result.get('parent')).toBeNull();
    expect(result.get('loader')).toBeNull();
    expect(result.get('action')).toBeNull();
    expect(result.get('error')).toEqual('header');
  });

  it('merges parent, loader & action headers if no error headers are present', () => {
    // GIVEN
    const shopify = shopifyApp(testConfig());
    const headers = {
      parentHeaders: new Headers([
        ['parent', 'header'],
        ['common', 'parent'],
      ]),
      loaderHeaders: new Headers([
        ['loader', 'header'],
        ['common', 'loader'],
      ]),
      actionHeaders: new Headers([
        ['action', 'header'],
        ['common', 'action'],
      ]),
      errorHeaders: new Headers(),
    };

    // WHEN
    const result = boundary.headers(headers);

    // THEN
    expect(result.get('parent')).toEqual('header');
    expect(result.get('loader')).toEqual('header');
    expect(result.get('action')).toEqual('header');
    expect(result.get('common')).toEqual('parent, loader, action');
  });

  it('returns an empty headers object if no headers are present', () => {
    // GIVEN
    const shopify = shopifyApp(testConfig());
    const headers = {};

    // WHEN
    const result = boundary.headers(headers as any);

    // THEN
    expect(result).toEqual(new Headers());
  });
});
