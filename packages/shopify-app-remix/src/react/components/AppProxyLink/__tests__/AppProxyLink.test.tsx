import {mount} from '@shopify/react-testing';

import '../../../__tests__/test-helper';

import {AppProxyLink} from '../AppProxyLink';
import {AppProxyProvider} from '../../AppProxyProvider';

describe('<AppProxyLink />', () => {
  it('throws an error if used outside of an AppProxyProvider', () => {
    // GIVEN
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // WHEN
    expect(() =>
      mount(<AppProxyLink href="/my-action">Hello world</AppProxyLink>),
    ).toThrow('AppProxyLink must be used within an AppProxyProvider component');
  });

  it('adds a trailing slash if one is missing', () => {
    // WHEN
    const component = mount(
      <AppProxyProvider appUrl="http://my-app.example.io">
        <AppProxyLink href="/my-action">Hello world</AppProxyLink>
      </AppProxyProvider>,
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
      <AppProxyProvider appUrl="http://my-app.example.io">
        <AppProxyLink href="/my-action/">Hello world</AppProxyLink>
      </AppProxyProvider>,
    );

    // THEN
    expect(component).toContainReactComponent('a', {
      href: 'http://localhost/my-action/',
    });
    expect(component).toContainReactHtml('Hello world');
  });
});
