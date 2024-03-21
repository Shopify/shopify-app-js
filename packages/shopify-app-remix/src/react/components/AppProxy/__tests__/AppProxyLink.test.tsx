import React from 'react';
import {mount} from '@shopify/react-testing';

import '../../../__tests__/test-helper';

import {AppProxyLink, AppProxyLinkProps} from '../AppProxyLink';

describe('<AppProxyLink />', () => {
  it('adds a trailing slash if one is missing', () => {
    // WHEN
    const component = mount(
      <AppProxyLink href="/my-action">Hello world</AppProxyLink>,
    );

    // THEN
    expect(component).toContainReactComponent('a', {
      href: 'http://localhost/my-action/',
    });
    expect(component).toContainReactHtml('Hello world');
  });

  it("doesn't alter the href if it has a trailing slash", () => {
    // WHEN
    const component = mount(
      <AppProxyLink href="/my-action/">Hello world</AppProxyLink>,
    );

    // THEN
    expect(component).toContainReactComponent('a', {
      href: 'http://localhost/my-action/',
    });
    expect(component).toContainReactHtml('Hello world');
  });
});
