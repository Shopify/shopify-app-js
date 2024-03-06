import React from 'react';
import {mount} from '@shopify/react-testing';

import '../../../__tests__/test-helper';

import {AppProxy} from '../AppProxy';

describe('<AppProxy />', () => {
  const defaultProps = {
    appUrl: 'test_app_url',
  };

  it('renders the script tag if the embedded app prop is passed in', () => {
    // WHEN
    const component = mount(<AppProxy {...defaultProps}>Hello world</AppProxy>);

    // THEN
    expect(component).toContainReactComponent('base', {
      href: defaultProps.appUrl,
    });
    expect(component).toContainReactHtml('Hello world');
  });
});
